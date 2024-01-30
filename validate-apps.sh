#!/bin/bash

# Function to perform HTTP GET request
http_get() {
    local url=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "$response"
}

# Find all manifest.json files recursively
manifest_files=$(find . -name "manifest.json")

# Loop through each manifest file
for file in $manifest_files; do
    # Extract href values from manifest.json
    hrefs=$(jq -r '.href' "$file")

    # Loop through each href
    for href in $hrefs; do
        # Perform HTTP GET request
        status_code=$(http_get "$href")

        # Check if status code is not 200
        if [[ $status_code -ge "400" ]]; then
            echo "HTTP $status_code : $href"
        fi
    done
done
