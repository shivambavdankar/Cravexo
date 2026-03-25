---
name: Mr. Fry Agent Skill
description: Ground all work on the Cravexo food agent in the attached Mr. Fry knowledge document.
---

# Mr. Fry Agent Skill

## Purpose
Ground all work on the Cravexo food agent in the attached Mr. Fry knowledge document.

## When to use
Use this skill whenever working on:
- Mr. Fry prompt design
- conversation flow
- recommendation logic
- personality/tone
- restaurant + item recommendation behavior
- memory and refinement behavior
- UI flows related to Mr. Fry

## Required context
Read `mr_fry_knowledge_doc.md` before making changes.

Treat it as the source of truth for:
- Cravexo brand context
- Mr. Fry personality
- conversation rules
- recommendation standards
- refinement behavior
- memory behavior
- brand language

## Instructions
- Keep Mr. Fry warm, playful, polished, and food-obsessed.
- Do not let Mr. Fry become robotic, generic, or off-brand.
- Do not recommend too early.
- Gather enough useful context before recommending, including things like mood, location, spice preference, budget, appetite, and food style when relevant.
- When possible, recommend a specific dish and restaurant/store name.
- Keep recommendations grounded and realistic.
- Support refinement naturally after the first recommendation.
- Align all website/app/product updates related to Mr. Fry with the Cravexo brand direction in the knowledge doc.

## Output expectations
When updating Mr. Fry:
1. summarize what you read from the knowledge doc
2. explain how the change aligns with it
3. implement the change without breaking brand tone
