#!/usr/bin/env python3
"""
Fetches latest AI model releases from Hugging Face and GitHub
Requires: pip install requests
"""
import re
import requests
from datetime import datetime, timedelta

def get_hf_models():
    """Fetch trending models from Hugging Face released in last 7 days"""
    one_week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    
    try:
        # Search for models created in last week, sorted by trending
        response = requests.get(
            "https://huggingface.co/api/models",
            params={
                "sort": "trending", 
                "limit": "10",
                "filter": "created_at:>" + one_week_ago
            },
            timeout=30
        )
        response.raise_for_status()
        models = response.json()
        
        results = []
        for model in models[:5]:  # Top 5
            created = model.get('createdAt', '')[:10]  # YYYY-MM-DD
            author = model.get('author', 'Unknown')
            model_id = model.get('id', '')
            name = model_id.split('/')[-1] if '/' in model_id else model_id
            
            results.append({
                "date": created,
                "model": name[:40] + "..." if len(name) > 40 else name,
                "org": author[:20] + "..." if len(author) > 20 else author,
                "link": f"https://huggingface.co/{model_id}"
            })
        return results
    except Exception as e:
        print(f"HF fetch error: {e}")
        return []

def get_github_trending():
    """Fetch trending ML repos from last week"""
    one_week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    
    try:
        response = requests.get(
            "https://api.github.com/search/repositories",
            params={
                "q": "language:python topic:machine-learning,deep-learning,llm created:>" + one_week_ago,
                "sort": "stars",
                "order": "desc",
                "per_page": "5"
            },
            timeout=30
        )
        response.raise_for_status()
        repos = response.json().get('items', [])
        
        results = []
        for repo in repos[:3]:  # Top 3
            created = repo.get('created_at', '')[:10]
            full_name = repo.get('full_name', '')
            owner = full_name.split('/')[0] if '/' in full_name else 'Unknown'
            
            results.append({
                "date": created,
                "model": repo.get('name', 'Unnamed')[:40],
                "org": owner[:20],
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
    
    # Generate the news HTML
    news_html = "<!-- AI_NEWS_START -->\n"
    
    if not news_items:
        news_html += '''    <div class="card">
      <small>Just now | System</small>
      <p>No new AI models found this week. Check back tomorrow!</p>
    </div>\n'''
    else:
        for item in news_items:
            news_html += f'''    <div class="card">
      <small>{item['date']} | {item['org']}</small>
      <h3>{item['model']}</h3>
      <a href="{item['link']}" target="_blank" style="color:#a584ff;text-decoration:none">View Model &rarr;</a>
    </div>\n'''
    news_html += "    <!-- AI_NEWS_END -->"

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
