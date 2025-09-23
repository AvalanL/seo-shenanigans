#!/usr/bin/env python3
import requests
import re
import os
from urllib.parse import urljoin
import time

# Instagram usernames extracted from the project
usernames = [
    "alvamorweddings",
    "avva.photography",
    "blomlabbet",
    "bloombythesea",
    "byamandalundberg",
    "bymaizoni",
    "djstockholm",
    "elinhang_makeupartist",
    "emkncreations",
    "emmihannaduo",
    "florera",
    "fotograf.andreaslofstrand",
    "hairandmakeupbyisabell",
    "ingridtjernstrom",
    "itisasign.se",
    "kruusemedia",
    "lightlovestudio",
    "lily.ray.photography",
    "lindaliveliasson",
    "liv.and.darcy",
    "makeupbymissevelina",
    "nordicplanner",
    "oresundstories",
    "oresundweddings",
    "rebeckawendesten",
    "samiralipnglow",
    "stockholmcatering",
    "strakkvarteret",
    "studioevie.se",
    "thesoulunit",
    "westcoastweddings"
]

def fetch_instagram_profile_pic(username):
    """
    Fetch Instagram profile picture using web scraping
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Try to get the Instagram page
        url = f"https://www.instagram.com/{username}/"
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            # Look for profile picture URL in the HTML
            content = response.text

            # Pattern to find profile picture URL
            profile_pic_pattern = r'"profile_pic_url_hd":"([^"]+)"'
            match = re.search(profile_pic_pattern, content)

            if not match:
                # Try alternative pattern
                profile_pic_pattern = r'"profile_pic_url":"([^"]+)"'
                match = re.search(profile_pic_pattern, content)

            if match:
                pic_url = match.group(1)
                # Decode escaped characters
                pic_url = pic_url.replace('\\u0026', '&')

                # Download the image
                pic_response = requests.get(pic_url, headers=headers, timeout=10)
                if pic_response.status_code == 200:
                    filename = f"{username}_profile.jpg"
                    with open(filename, 'wb') as f:
                        f.write(pic_response.content)
                    print(f"✓ Downloaded: {filename}")
                    return True
                else:
                    print(f"✗ Failed to download image for {username}")
            else:
                print(f"✗ Could not find profile picture URL for {username}")
        else:
            print(f"✗ Failed to access Instagram page for {username} (status: {response.status_code})")

    except Exception as e:
        print(f"✗ Error fetching {username}: {str(e)}")

    return False

def main():
    print(f"Fetching profile pictures for {len(usernames)} Instagram accounts...")

    successful = 0
    failed = 0

    for i, username in enumerate(usernames, 1):
        print(f"[{i}/{len(usernames)}] Fetching {username}...")

        if fetch_instagram_profile_pic(username):
            successful += 1
        else:
            failed += 1

        # Add delay to avoid rate limiting
        if i < len(usernames):
            time.sleep(2)

    print(f"\nCompleted: {successful} successful, {failed} failed")

if __name__ == "__main__":
    main()