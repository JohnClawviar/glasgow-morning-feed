#!/usr/bin/env python3
"""
Fetches latest AI model releases from Hugging Face and GitHub
Requires: pip install requests
"""
import re
import requests
from datetime import datetime, timedelta

def get_hf_models():
    """Fetch trending models from Hugging Face"""
    try:
        # Try downloading list without sort first to see available options
        response = requests.get(
            "https://huggingface.co/api/models",
            params={"limit": "30"},
            timeout=30
        )
        response.raise_for_status()
        models = response.json()
        
        # Sort by downloads (trending proxy) since createdAt sorting isn't working
        sorted_models = sorted(
            models,
            key=lambda x: x.get('downloads', 0),
            reverse=True
        )
        
        results = []
        for model in sorted_models[:5]:
            created = model.get('createdAt', '')[:10]
            if not created:
                created = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
                
            author = model.get('author', 'Unknown')
            model_id = model.get('id', '')
            if not model_id:
                continue
            name = model_id.split('/')[-1] if '/' in model_id else model_id
            
            results.append({
                "date": created,
                "model": name[:35] + ("..." if len(name) > 35 else ""),
                "org": author[:18] + ("..." if len(author) > 18 else ""),
                "link": f"https://huggingface.co/{model_id}"
            })
        return results
    except Exception as e:
        print(f"HF fetch error: {e}")
        return []

def get_github_trending():
    """Fetch recent ML repos"""
    try:
        response = requests.get(
            "https://api.github.com/search/repositories",
            params={
                "q": "topic:machine-learning",
                "sort": "updated",
                "order": "desc",
                "per_page": "5"
            },
            timeout=30
        )
        response.raise_for_status()
        repos = response.json().get('items', [])
        
        results = []
        for repo in repos[:3]:
            pushed = repo.get('pushed_at', '')[:10]
            if not pushed:
                pushed = (datetime.now()).strftime('%Y-%m-%d')
            full_name = repo.get('full_name', '')
            owner = full_name.split('/')[0] if '/' in full_name else 'Unknown'
            
            results.append({
                "date": pushed,
                "model": repo.get('name', 'Unnamed')[:35],
                "org": owner[:18],
                "link": repo.get('html_url', '')
            })
        return results
    except Exception as e:
        print(f"GitHub fetch error: {e}")
        return []

def fetch_ai_news():
    """Combine sources, deduplicate by link, return sorted by date"""
    all_news = get_hf_models() + get_github_trending()
    
    # Deduplicate by link
    seen = set()
    unique = []
    for item in all_news:
        if item['link'] and item['link'] not in seen:
            seen.add(item['link'])
            unique.append(item)
    
    # Sort by date descending
    unique.sort(key=lambda x: x['date'], reverse=True)
    
    return unique[:5]  # Return top 5 most recent

def update_html():
    with open('index.html', 'r') as f:
        content = f.read()

    # Fetch real news
    news_items = fetch_ai_news()
    
    # Generate the news HTML matching the dashboard style
    news_html = "<!-- AI_NEWS_START -->\n"
    
    if not news_items:
        news_html += '''          <div class="news-item">
            <div class="news-meta">Just now | System</div>
            <h4>No new AI models found</h4>
            <p>Check back tomorrow!</p>
          </div>\n'''
    else:
        for item in news_items:
            name = item['model'].replace('...', '')  # Remove truncation markers
            news_html += f'''          <div class="news-item">
            <div class="news-meta">{item['date']} | {item['org']}</div>
            <h4>{name}</h4>
            <a href="{item['link']}" target="_blank">Read &rarr;</a>
          </div>\n'''
    news_html += "          <!-- AI_NEWS_END -->"

    # Replace the old news block
    start_tag = "<!-- AI_NEWS_START -->"
    end_tag = "<!-- AI_NEWS_END -->"
    
    import re
    content = re.sub(f"{re.escape(start_tag)}.*?{re.escape(end_tag)}", news_html, content, flags=re.DOTALL)

    with open('index.html', 'w') as f:
        f.write(content)
    
    print(f"Updated {len(news_items)} items at {datetime.now().isoformat()}")

if __name__ == "__main__":
    update_html()
