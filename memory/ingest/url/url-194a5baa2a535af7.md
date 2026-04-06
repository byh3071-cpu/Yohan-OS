---

## schema_version: ingest.v0

kind: url
subtype: article
source_url: [https://github.com/anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python)
canonical_url: [https://github.com/anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python)
title: GitHub - anthropics/anthropic-sdk-python
site: github.com
ingested_at: 2026-04-06T11:17:46.165Z

# GitHub - anthropics/anthropic-sdk-python

Claude SDK for Python

The Claude SDK for Python provides access to the Claude API from Python applications.
Documentation
Full documentation is available at platform.claude.com/docs/en/api/sdks/python.
Installation
pip install anthropic
Getting started
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),  # This is the default and can be omitted
)

message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude",
        }
    ],
    model="claude-opus-4-6",
)
print(message.content)
Requirements
Python 3.9+
Contributing
See CONTRIBUTING.md.
License
This project is licensed under the MIT License. See the LICENSE file for details.

**원문:** [열기](https://github.com/anthropics/anthropic-sdk-python)