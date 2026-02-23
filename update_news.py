import json
import os
from datetime import datetime, timedelta

# Mocking the AI news data from the search result for the initial run
# In a real GitHub Action, we could use a search API or RSS feed.
AI_NEWS = [
    {"date": "2026-02-19", "model": "Gemini 3.1 Pro", "org": "Google", "link": "https://www.cnet.com/tech/services-and-software/google-announces-gemini-3-1-pro/"},
    {"date": "2026-02-17", "model": "Claude Sonnet 4.6", "org": "Anthropic", "link": "https://theaiinsider.tech/2026/02/18/anthropic-launches-sonnet-4-6-ai-model-with-expanded-context-window-and-coding-improvements/"},
    {"date": "2026-02-16", "model": "Qwen3.5-397B", "org": "Alibaba", "link": "https://llm-stats.com/llm-updates"},
    {"date": "2026-02-11", "model": "GLM-5", "org": "Zhipu AI", "link": "https://llm-stats.com/llm-updates"},
    {"date": "2026-02-05", "model": "Claude Opus 4.6", "org": "Anthropic", "link": "https://theaiinsider.tech/2026/02/18/anthropic-launches-sonnet-4-6-ai-model-with-expanded-context-window-and-coding-improvements/"}
]

def update_html():
    with open('index.html', 'r') as f:
        content = f.read()

    # Generate the news HTML
    news_html = "<!-- AI_NEWS_START -->\n"
    for item in AI_NEWS:
        news_html += f'''    <div class="card">
      <small>{item['date']} | {item['org']}</small>
      <h3>{item['model']}</h3>
      <a href="{item['link']}" target="_blank" style="color:#a584ff;text-decoration:none">Read Announcement &rarr;</a>
    </div>\n'''
    news_html += "    <!-- AI_NEWS_END -->"

    # Replace the old news block if it exists, otherwise add it after the weather
    start_tag = "<!-- AI_NEWS_START -->"
    end_tag = "<!-- AI_NEWS_END -->"

    if start_tag in content:
        import re
        content = re.sub(f"{start_tag}.*?{end_tag}", news_html, content, flags=re.DOTALL)
    else:
        # Insert after the weather card
        content = content.replace('</div>\n  </div>', f'</div>\n{news_html}\n  </div>')

    with open('index.html', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    update_html()
