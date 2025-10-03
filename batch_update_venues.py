#!/usr/bin/env python3
"""
Batch update venue summary fields with improved, specific descriptions.
This script reads venue MDX files and generates concise, unique summaries.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Path to venues directory
VENUES_DIR = Path("/Users/benjamin/Desktop/seo-shenanigans/apps/marketing/src/content/venues")

# Track statistics
stats = {
    "total_files": 0,
    "processed": 0,
    "updated": 0,
    "skipped": 0,
    "errors": []
}

def extract_venue_info(content: str) -> Dict[str, str]:
    """Extract key information from venue content."""
    info = {}

    # Extract frontmatter fields
    patterns = {
        "title": r'^title:\s*"(.+?)"$',
        "city": r'^city:\s*"(.+?)"$',
        "region": r'^region:\s*"(.+?)"$',
        "style": r'^style:\s*"(.+?)"$',
        "capacity": r'^capacity:\s*(\d+)$',
        "summary": r'^summary:\s*"(.+?)"$',
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, content, re.MULTILINE)
        if match:
            info[key] = match.group(1)

    # Extract main content (first paragraph after "## Om lokalen")
    content_match = re.search(r'## Om lokalen\n\n(.+?)(?:\n\n|\Z)', content, re.DOTALL)
    if content_match:
        # Clean up the content - remove region prefixes and "Posted X ago" text
        main_content = content_match.group(1)
        main_content = re.sub(r'^[A-ZÅÄÖ][a-zåäö\s,]+Posted \d+ [a-zåäö]+ ago', '', main_content)
        main_content = re.sub(r'^[A-ZÅÄÖ][a-zåäö\s,]+Bröllop', '', main_content)
        info["content"] = main_content[:500].strip()  # First 500 chars

    return info

def generate_improved_summary(info: Dict[str, str]) -> str:
    """Generate an improved summary based on venue information."""
    title = info.get("title", "")
    city = info.get("city", "")
    region = info.get("region", "")
    style = info.get("style", "")
    capacity = info.get("capacity", "0")
    content = info.get("content", "")
    current_summary = info.get("summary", "")

    # If summary is already good (doesn't start with region, no "Posted", decent length)
    if (len(current_summary) > 80 and
        not current_summary.startswith(tuple(['Stockholm', 'Skåne', 'Kalmar', 'Kronoberg',
                                               'Västra Götaland', 'Halland', 'Göteborg'])) and
        'Posted' not in current_summary and
        current_summary != title and
        'Bröllop - Ha ert bröllop' not in current_summary):
        return None  # No update needed

    # Try to extract key features from content
    features = []

    # Check for specific keywords in content
    if any(word in content.lower() for word in ['herrgård', 'slott', '1600-tal', '1700-tal', '1800-tal']):
        if 'herrgård' in content.lower():
            features.append('herrgård')
        if 'slott' in content.lower():
            features.append('slott')

    if any(word in content.lower() for word in ['utsikt', 'sjö', 'hav', 'vatten', 'strand', 'brygga']):
        if 'utsikt' in content.lower():
            features.append('utsikt')
        if any(w in content.lower() for w in ['sjö', 'hav', 'vatten']):
            features.append('vid vattnet')

    if any(word in content.lower() for word in ['boende', 'hotell', 'rum', 'övernatt']):
        features.append('boende')

    if any(word in content.lower() for word in ['egen mat', 'självhushåll', 'catering']):
        if 'egen mat' in content.lower() or 'självhushåll' in content.lower():
            features.append('egen mat tillåten')

    # Build summary
    summary_parts = []

    # Start with style/type if available
    if style and style != "Okänd":
        if style in ['Slott & Herrgård', 'Lantlig idyll']:
            summary_parts.append(style.split('&')[0].strip() if '&' in style else style)

    # Add location
    if city and city != "Okänd":
        location = f"i {city}" if city != region else f"i {region}"
        summary_parts.append(location)

    # Add capacity if meaningful
    if capacity and int(capacity) > 0:
        summary_parts.append(f"för {capacity} gäster")

    # Add features
    if features:
        summary_parts.extend(features[:2])  # Max 2 features

    # Fallback: create generic but specific summary
    if not summary_parts:
        location_str = city if city and city != "Okänd" else region
        if style:
            return f"Bröllopslokal i {location_str} med {style.lower()}-känsla."
        else:
            return f"Unik bröllopslokal i {location_str} för minnesvärda bröllopsfester."

    # Combine parts into natural Swedish
    summary = " ".join(summary_parts)

    # Ensure it's a complete sentence
    if not summary.endswith('.'):
        summary += '.'

    # Capitalize first letter
    summary = summary[0].upper() + summary[1:] if len(summary) > 1 else summary.upper()

    return summary

def needs_update(current_summary: str) -> bool:
    """Check if a summary needs updating."""
    if not current_summary:
        return True

    # Check for indicators of poor quality
    poor_indicators = [
        'Posted',
        current_summary.startswith(('Stockholm', 'Skåne', 'Kalmar', 'Kronoberg',
                                    'Västra Götaland', 'Halland', 'Göteborg',
                                    'Uppsala', 'Väst', 'Jämt', 'Gävle')),
        len(current_summary) < 50,
        'Bröllop - Ha ert bröllop' in current_summary,
        'Se vår fina Bröllopslokal' in current_summary,
    ]

    return any(poor_indicators)

def update_venue_file(file_path: Path) -> bool:
    """Update a single venue file's summary. Returns True if updated."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract venue info
        info = extract_venue_info(content)
        current_summary = info.get("summary", "")

        # Check if update is needed
        if not needs_update(current_summary):
            return False

        # Generate improved summary
        new_summary = generate_improved_summary(info)

        if not new_summary or new_summary == current_summary:
            return False

        # Update the content
        summary_pattern = r'^summary:\s*"(.+?)"$'
        new_content = re.sub(
            summary_pattern,
            f'summary: "{new_summary}"',
            content,
            count=1,
            flags=re.MULTILINE
        )

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✓ Updated: {file_path.name}")
        print(f"  Old: {current_summary[:80]}...")
        print(f"  New: {new_summary}")
        print()

        return True

    except Exception as e:
        stats["errors"].append((file_path.name, str(e)))
        print(f"✗ Error processing {file_path.name}: {e}")
        return False

def main():
    """Main processing function."""
    print("=" * 80)
    print("VENUE SUMMARY BATCH UPDATE")
    print("=" * 80)
    print()

    # Get all MDX files
    mdx_files = sorted(VENUES_DIR.glob("*.mdx"))
    stats["total_files"] = len(mdx_files)

    print(f"Found {stats['total_files']} venue files")
    print()
    print("Processing files...")
    print("-" * 80)
    print()

    for file_path in mdx_files:
        stats["processed"] += 1

        if update_venue_file(file_path):
            stats["updated"] += 1
        else:
            stats["skipped"] += 1

    # Print summary
    print()
    print("=" * 80)
    print("SUMMARY REPORT")
    print("=" * 80)
    print(f"Total files processed: {stats['processed']}")
    print(f"Files updated: {stats['updated']}")
    print(f"Files skipped (already good): {stats['skipped']}")
    print(f"Errors: {len(stats['errors'])}")

    if stats["errors"]:
        print()
        print("Errors encountered:")
        for filename, error in stats["errors"]:
            print(f"  - {filename}: {error}")

    print()
    print(f"✓ Batch update complete!")
    print("=" * 80)

if __name__ == "__main__":
    main()
