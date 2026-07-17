
CONTENT_TYPE_TEMPLATES = {
    "linkedin_post": {
        "description": "LinkedIn post (max 3000 characters, professional, includes a hook, body, and call-to-action)",
        "format_hint": "Start with a bold hook. Use line breaks. End with a CTA or question.",
        "max_words": 400,
    },
    "blog": {
        "description": "Long-form blog article (800–1500 words, SEO-friendly, includes H2 sections)",
        "format_hint": "Include an intro, 3–5 H2 sections, and a conclusion with takeaways.",
        "max_words": 1500,
    },
    "twitter_thread": {
        "description": "Twitter/X thread (10–15 tweets, each under 280 characters, numbered)",
        "format_hint": "Number each tweet (1/, 2/, etc.). Each tweet must be self-contained.",
        "max_words": 350,
    },
    "newsletter": {
        "description": "Email newsletter section (300–600 words, conversational, includes subject line suggestion)",
        "format_hint": "Start with a subject line suggestion. Use short paragraphs and a single CTA.",
        "max_words": 600,
    },
    "youtube_script": {
        "description": "YouTube video script (500–1000 words, includes intro hook, chapters, and outro)",
        "format_hint": "Hook in first 30 seconds. Use [PAUSE], [B-ROLL] markers. End with subscribe CTA.",
        "max_words": 1000,
    },
    "instagram_caption": {
        "description": "Instagram caption (150–300 characters, punchy, with 5–10 relevant hashtags)",
        "format_hint": "Short punchy sentence. Two line breaks. 5–10 hashtags at end.",
        "max_words": 80,
    },
}

def get_template(content_type: str) -> dict:
    return CONTENT_TYPE_TEMPLATES.get(content_type, CONTENT_TYPE_TEMPLATES["blog"])
