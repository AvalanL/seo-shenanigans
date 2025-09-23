#!/usr/bin/env python3
"""Fetch Instagram profile images and metadata for supplier entries.

The script reads MDX files in the suppliers directory, extracts Instagram
profile URLs, and fetches open graph metadata using Playwright. Optionally it
can download the profile image and update each MDX file with the local asset
path.

Usage examples:

    # Basic metadata export to JSON (default paths)
    python3 scripts/fetch_instagram_profiles.py

    # Export to CSV and download images into the public assets folder
    python3 scripts/fetch_instagram_profiles.py \
        --output-json apps/marketing/data/directories/instagram-profiles.json \
        --output-csv apps/marketing/data/directories/instagram-profiles.csv \
        --download-dir apps/marketing/public/assets/directories/suppliers/instagram \
        --update-mdx

Prerequisites:
    pip install playwright pyyaml
    python3 -m playwright install chromium
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import yaml
from playwright.async_api import async_playwright

DEFAULT_SUPPLIER_ROOT = Path("apps/marketing/src/content/suppliers")
DEFAULT_DOWNLOAD_DIR = Path(
    "apps/marketing/public/assets/directories/suppliers/instagram"
)
DEFAULT_JSON_PATH = Path("apps/marketing/data/directories/instagram-profiles.json")
DEFAULT_CSV_PATH = Path("apps/marketing/data/directories/instagram-profiles.csv")
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/121.0.0.0 Safari/537.36"
)


@dataclass
class SupplierEntry:
    path: Path
    category: str
    title: str
    instagram_url: str

    @property
    def slug(self) -> str:
        return self.path.stem


@dataclass
class InstagramProfile:
    username: str
    profile_url: str
    og_title: Optional[str]
    og_description: Optional[str]
    og_image: Optional[str]
    biography: Optional[str]
    full_name: Optional[str]
    follower_count: Optional[int]
    media_count: Optional[int]
    image_path: Optional[Path] = None
    error: Optional[str] = None

    def as_dict(self) -> Dict[str, Optional[str]]:
        return {
            "username": self.username,
            "profile_url": self.profile_url,
            "og_title": self.og_title,
            "og_description": self.og_description,
            "og_image": self.og_image,
            "biography": self.biography,
            "full_name": self.full_name,
            "follower_count": self.follower_count,
            "media_count": self.media_count,
            "image_path": str(self.image_path) if self.image_path else None,
            "error": self.error,
        }


def read_front_matter(path: Path) -> Optional[Dict[str, object]]:
    raw = path.read_text(encoding="utf-8")
    if not raw.startswith("---"):
        return None
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return None
    front_matter = parts[1]
    data = yaml.safe_load(front_matter) or {}
    if not isinstance(data, dict):
        return None
    return data


def collect_suppliers(root: Path) -> List[SupplierEntry]:
    entries: List[SupplierEntry] = []
    for mdx_file in sorted(root.rglob("*.mdx")):
        data = read_front_matter(mdx_file)
        if not data:
            continue
        instagram_url = str(data.get("instagram", "")).strip()
        if not instagram_url:
            continue
        category = str(data.get("category", "")).strip()
        title = str(data.get("title", mdx_file.stem)).strip()
        clean_url, _ = normalise_instagram_url(instagram_url)
        if not clean_url:
            continue
        entries.append(
            SupplierEntry(
                path=mdx_file,
                category=category,
                title=title,
                instagram_url=clean_url,
            )
        )
    return entries


def normalise_instagram_url(url: str) -> Tuple[Optional[str], Optional[str]]:
    """Return canonical profile URL and username."""
    url = url.strip()
    if not url:
        return None, None
    if url.startswith("@"):  # handle @username format
        username = url[1:]
        return f"https://www.instagram.com/{username}/", username
    parsed = urlparse(url)
    if not parsed.scheme:
        # assume missing scheme and @ symbol removed already
        username = parsed.path.strip("/")
        if not username:
            return None, None
        return f"https://www.instagram.com/{username}/", username
    path = parsed.path.strip("/")
    if not path:
        return None, None
    username = path.split("/")[0]
    if not username:
        return None, None
    return f"https://www.instagram.com/{username}/", username


async def fetch_profile(
    playwright,
    profile_url: str,
    headless: bool = True,
    timeout: int = 25000,
) -> InstagramProfile:
    _, username = normalise_instagram_url(profile_url)
    if not username:
        return InstagramProfile(
            username="",
            profile_url=profile_url,
            og_title=None,
            og_description=None,
            og_image=None,
            biography=None,
            full_name=None,
            follower_count=None,
            media_count=None,
            error="Could not determine username",
        )

    browser = await playwright.chromium.launch(headless=headless)
    context = await browser.new_context(user_agent=USER_AGENT)
    page = await context.new_page()

    try:
        await page.goto(profile_url, wait_until="networkidle", timeout=timeout)
        og_title = await page.get_attribute('meta[property="og:title"]', "content")
        og_description = await page.get_attribute(
            'meta[property="og:description"]', "content"
        )
        og_image = await page.get_attribute('meta[property="og:image"]', "content")

        ld_data = await page.evaluate(
            """
            () => {
              const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
              for (const script of scripts) {
                try {
                  const data = JSON.parse(script.textContent);
                  if (data['@type'] === 'Person' || data['@type'] === 'Organization') {
                    return data;
                  }
                } catch (err) {
                  // ignore parse errors
                }
              }
              return null;
            }
            """
        )

        profile_json = await page.evaluate(
            """
            () => {
              const script = Array.from(document.scripts).find((node) =>
                node.textContent && node.textContent.includes('profile_pic_url_hd')
              );
              if (!script || !script.textContent) {
                return null;
              }
              try {
                const match = script.textContent.match(/profile_pic_url_hd":"([^"\\]+)"/);
                const biography = script.textContent.match(/"biography":"([^"\\]*)"/);
                const fullName = script.textContent.match(/"full_name":"([^"\\]*)"/);
                const followers = script.textContent.match(/"edge_followed_by":\{"count":(\d+)}/);
                const media = script.textContent.match(/"edge_owner_to_timeline_media":\{"count":(\d+)}/);
                return {
                  profile_pic_url_hd: match ? decodeURIComponent(match[1].replace(/\\\\u0026/g, '&')) : null,
                  biography: biography ? decodeURIComponent(biography[1].replace(/\\\\u0026/g, '&')) : null,
                  full_name: fullName ? decodeURIComponent(fullName[1].replace(/\\\\u0026/g, '&')) : null,
                  follower_count: followers ? parseInt(followers[1], 10) : null,
                  media_count: media ? parseInt(media[1], 10) : null,
                };
              } catch (err) {
                return null;
              }
            }
            """
        )

        await browser.close()

        biography = None
        full_name = None
        follower_count = None
        media_count = None
        profile_pic_url_hd = None

        if profile_json:
            profile_pic_url_hd = profile_json.get("profile_pic_url_hd")
            biography = profile_json.get("biography")
            full_name = profile_json.get("full_name")
            follower_count = profile_json.get("follower_count")
            media_count = profile_json.get("media_count")

        if ld_data and not biography:
            biography = ld_data.get("description")
        if ld_data and not full_name:
            full_name = ld_data.get("name")
        if not og_image and profile_pic_url_hd:
            og_image = profile_pic_url_hd

        return InstagramProfile(
            username=username,
            profile_url=profile_url,
            og_title=og_title,
            og_description=og_description,
            og_image=og_image,
            biography=biography,
            full_name=full_name,
            follower_count=follower_count,
            media_count=media_count,
        )
    except Exception as exc:  # pylint: disable=broad-except
        await browser.close()
        return InstagramProfile(
            username=username,
            profile_url=profile_url,
            og_title=None,
            og_description=None,
            og_image=None,
            biography=None,
            full_name=None,
            follower_count=None,
            media_count=None,
            error=str(exc),
        )


async def fetch_all_profiles(
    profile_urls: Iterable[str],
    headless: bool = True,
    timeout: int = 25000,
) -> Dict[str, InstagramProfile]:
    profile_map: Dict[str, InstagramProfile] = {}

    async with async_playwright() as playwright:
        for url in profile_urls:
            profile = await fetch_profile(playwright, url, headless=headless, timeout=timeout)
            profile_map[url] = profile
    return profile_map


def download_image(url: str, dest_dir: Path, username: str) -> Optional[Path]:
    if not url:
        return None
    dest_dir.mkdir(parents=True, exist_ok=True)
    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix
    if not suffix:
        suffix = ".jpg"
    filename = f"{slugify(username)}{suffix}"
    destination = dest_dir / filename

    req = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req) as response, destination.open("wb") as output:  # type: ignore[arg-type]
            output.write(response.read())
    except Exception as exc:  # pylint: disable=broad-except
        print(f"[warn] Could not download {url}: {exc}", file=sys.stderr)
        return None
    return destination


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def update_mdx_image(path: Path, new_image: str) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    inside_front_matter = False
    image_index: Optional[int] = None
    frontmatter_end: Optional[int] = None
    for index, line in enumerate(lines):
        if line.strip() == "---":
            if not inside_front_matter:
                inside_front_matter = True
                continue
            frontmatter_end = index
            break
        if inside_front_matter and line.startswith("image:"):
            image_index = index
    desired_line = f'image: "{new_image}"'
    if image_index is not None:
        if lines[image_index] == desired_line:
            return False
        lines[image_index] = desired_line
    else:
        insert_at = frontmatter_end if frontmatter_end is not None else len(lines)
        lines.insert(insert_at, desired_line)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return True

def write_json(profiles: List[Dict[str, Optional[str]]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(profiles, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_csv(profiles: List[Dict[str, Optional[str]]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "username",
        "profile_url",
        "og_title",
        "og_description",
        "og_image",
        "biography",
        "full_name",
        "follower_count",
        "media_count",
        "image_path",
        "error",
    ]
    with output_path.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(profiles)


def determine_public_path(image_path: Path) -> str:
    try:
        public_index = image_path.parts.index("public")
    except ValueError:
        return str(image_path)
    rel_parts = image_path.parts[public_index + 1 :]
    return "/" + "/".join(rel_parts)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch Instagram metadata for suppliers")
    parser.add_argument(
        "--input-root",
        type=Path,
        default=DEFAULT_SUPPLIER_ROOT,
        help="Path to suppliers content root (default: apps/marketing/src/content/suppliers)",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=DEFAULT_JSON_PATH,
        help="Where to write JSON metadata (default: apps/marketing/data/directories/instagram-profiles.json)",
    )
    parser.add_argument(
        "--output-csv",
        type=Path,
        default=DEFAULT_CSV_PATH,
        help="Where to write CSV metadata (default: apps/marketing/data/directories/instagram-profiles.csv)",
    )
    parser.add_argument(
        "--download-dir",
        type=Path,
        default=None,
        help="Directory to store downloaded profile images (default: none)",
    )
    parser.add_argument(
        "--update-mdx",
        action="store_true",
        help="Update image field in each MDX once download succeeds",
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run Playwright with a visible browser (for debugging/login)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=25000,
        help="Navigation timeout in milliseconds (default: 25000)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    supplier_entries = collect_suppliers(args.input_root)
    if not supplier_entries:
        print("No suppliers with Instagram URLs found.")
        return

    unique_urls = sorted({entry.instagram_url for entry in supplier_entries})

    profiles_map = asyncio.run(
        fetch_all_profiles(unique_urls, headless=not args.no_headless, timeout=args.timeout)
    )

    download_dir = args.download_dir
    if download_dir is None and args.update_mdx:
        download_dir = DEFAULT_DOWNLOAD_DIR

    per_supplier_results: List[Dict[str, Optional[str]]] = []

    for entry in supplier_entries:
        profile = profiles_map.get(entry.instagram_url)
        if profile is None:
            profile = InstagramProfile(
                username="",
                profile_url=entry.instagram_url,
                og_title=None,
                og_description=None,
                og_image=None,
                biography=None,
                full_name=None,
                follower_count=None,
                media_count=None,
                error="Profile not fetched",
            )
        image_path = None
        if download_dir and profile.og_image and not profile.error:
            image_path = download_image(profile.og_image, download_dir, profile.username)
            if image_path:
                profile.image_path = image_path
                if args.update_mdx:
                    public_path = determine_public_path(image_path)
                    updated = update_mdx_image(entry.path, public_path)
                    if updated:
                        print(f"Updated image for {entry.slug} -> {public_path}")
        per_supplier_results.append(
            {
                **profile.as_dict(),
                "supplier_slug": entry.slug,
                "supplier_title": entry.title,
                "supplier_category": entry.category,
                "mdx_path": str(entry.path),
            }
        )

    write_json(per_supplier_results, args.output_json)
    write_csv(per_supplier_results, args.output_csv)
    print(f"Saved JSON metadata to {args.output_json}")
    print(f"Saved CSV metadata to {args.output_csv}")


if __name__ == "__main__":
    main()
