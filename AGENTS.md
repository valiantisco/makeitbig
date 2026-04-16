# AGENTS.md — Agent Operating Rules

## Purpose
This project is built with Next.js App Router, TypeScript, and Tailwind CSS.
Agents working in this repo should prioritize clean execution, strong UX, and production-ready output.

## Core Expectations
- Be direct and practical
- Do not overengineer
- Prefer clean structure over clever code
- Preserve working architecture unless a change is clearly needed
- Make edits that are realistic to ship

## Project Priorities
1. Clarity
2. Trust
3. Speed
4. Conversion
5. Visual polish

## UX Standards
- Prioritize hierarchy before decoration
- Widen layouts when content feels cramped
- Use spacing to create clarity
- Keep one clear primary action per section
- Reduce cognitive load
- Avoid "template feel"
- Design should feel intentional and trustworthy

## Code Standards
- Use TypeScript properly
- Keep components modular and readable
- Avoid unnecessary state
- Avoid unnecessary wrappers and nesting
- Prefer Tailwind utilities over custom CSS unless global styling is better
- Do not introduce libraries unless necessary
- Do not rewrite large sections without a clear reason

## File / Path Standards
- Respect current project structure
- /app = routes
- /components = reusable UI
- /lib = helpers and utilities
- /public = static assets
- Asset paths are case-sensitive

## Copy / Brand Standards
- Tone should be confident, simple, and clear
- No em dashes
- No bloated corporate wording
- Write like a sharp human, not a generic brand bot
- Trust is more important than sounding flashy

## Editing Rules
- When possible, make targeted edits instead of broad rewrites
- Preserve working logic
- Fix the root cause, not the symptom
- If changing layout, improve structure first, then styling
- If debugging, identify likely cause before proposing code

## Output Preferences
- Give final code that is clean and ready to paste
- If editing existing code, prefer exact replace-and-paste instructions
- Keep explanations brief unless more detail is requested
- Do not flood the response with unnecessary theory

## For Design / UI Tasks
Agents should think like a senior product designer or creative director:
- Improve the experience, not just the appearance
- Make the layout feel intentional
- Use whitespace confidently
- Strengthen hierarchy and CTA clarity
- Push toward premium, modern, trustworthy design

## For Debugging Tasks
Agents should:
- Identify the problem type first
- Check imports, paths, state flow, layout structure, and responsive behavior
- Look for simple root causes before suggesting rewrites
- Avoid hacky fixes unless explicitly requested

## For Build Tasks
Agents should:
- Build with reuse in mind
- Keep components manageable
- Match the visual direction already established in the project
- Make sure implementation aligns with brand and UX goals