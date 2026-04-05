import json
import logging
from typing import List, Dict, Any
from urllib.parse import urlparse
from models.schemas import HAREndpoint

logger = logging.getLogger(__name__)

NOISE_DOMAINS = [
    "google-analytics.com", "googletagmanager.com", "facebook.com", "facebook.net",
    "hotjar.com", "mixpanel.com", "segment.com", "doubleclick.net", "sentry.io",
    "cdn", "cloudfront.net", "akamaihd.net"
]

NOISE_EXTENSIONS = [
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot",
    ".css", ".js"
]

def is_noise(url: str, mime_type: str) -> bool:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    path = parsed_url.path.lower()

    if any(noise in domain for noise in NOISE_DOMAINS):
        return True

    if any(path.endswith(ext) for ext in NOISE_EXTENSIONS):
        return True

    mime_lower = mime_type.lower()
    if any(t in mime_lower for t in ["image/", "font/", "text/css", "text/javascript", "application/javascript"]):
        return True

    return False

def is_api_endpoint(url: str, mime_type: str, req_type: str) -> bool:
    path = urlparse(url).path.lower()
    
    if "application/json" in mime_type.lower():
        return True
    
    if "/api/" in path:
        return True
        
    if req_type.lower() in ["xhr", "fetch"]:
        return True
        
    return False

def extract_headers(har_headers: List[Dict[str, str]]) -> Dict[str, str]:
    useful = {}
    ignore = [
        "accept", "accept-encoding", "accept-language", "connection", "host", 
        "origin", "referer", "user-agent", "content-length", "cookie", "dnt", 
        "pragma", "cache-control", "upgrade-insecure-requests", "sec-ch-ua",
        "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-fetch-dest", 
        "sec-fetch-mode", "sec-fetch-site", "sec-fetch-user"
    ]
    for h in har_headers:
        name = h["name"].lower()
        if name not in ignore and not name.startswith("sec-") and not name.startswith("x-"):
            useful[h["name"]] = h["value"]
    return useful

def parse_har_file(content: str) -> List[HAREndpoint]:
    try:
        har_data = json.loads(content)
        entries = har_data.get("log", {}).get("entries", [])
    except json.JSONDecodeError:
        logger.error("Failed to parse HAR file as JSON.")
        return []

    endpoints: List[HAREndpoint] = []

    for entry in entries:
        request = entry.get("request", {})
        response = entry.get("response", {})
        
        url = request.get("url", "")
        method = request.get("method", "")
        
        mime_type = response.get("content", {}).get("mimeType", "")
        req_type = entry.get("_resourceType", "")

        if is_noise(url, mime_type):
            continue

        if not is_api_endpoint(url, mime_type, req_type):
            continue

        request_headers = extract_headers(request.get("headers", []))
        
        request_body = None
        post_data = request.get("postData")
        if post_data:
            request_body = post_data.get("text")
            if request_body and len(request_body) > 200:
                request_body = request_body[:200] + "... [truncated]"
            
        status = response.get("status", 0)
        
        response_body = response.get("content", {}).get("text", "")
        if response_body:
            response_body = response_body[:100]

        endpoint = HAREndpoint(
            method=method,
            url=url,
            request_headers=request_headers,
            request_body=request_body,
            response_status=status,
            response_body=response_body
        )
        endpoints.append(endpoint)

    return endpoints[:10]
