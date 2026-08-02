from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DOCS.mkdir(parents=True, exist_ok=True)

W, H = 1600, 900
NAVY = (12, 29, 52)
GOLD = (205, 164, 52)
CREAM = (247, 243, 232)
WHITE = (255, 255, 255)
MID = (92, 104, 120)
LIGHT = (223, 228, 234)
GREEN = (47, 124, 92)
RED = (158, 58, 58)

FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size: int, bold: bool = False):
    path = FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(path, size)


def rounded_box(draw, xy, title, subtitle="", fill=WHITE, outline=LIGHT, title_fill=NAVY):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=24, fill=fill, outline=outline, width=3)
    draw.text((x1 + 26, y1 + 22), title, font=font(27, True), fill=title_fill)
    if subtitle:
        draw.multiline_text(
            (x1 + 26, y1 + 66), subtitle, font=font(18), fill=MID, spacing=6
        )


def arrow(draw, start, end, color=GOLD, width=7):
    draw.line([start, end], fill=color, width=width)
    x2, y2 = end
    x1, y1 = start
    dx, dy = x2 - x1, y2 - y1
    length = max((dx * dx + dy * dy) ** 0.5, 1)
    ux, uy = dx / length, dy / length
    px, py = -uy, ux
    size = 18
    p1 = (x2, y2)
    p2 = (x2 - ux * size + px * size * 0.6, y2 - uy * size + py * size * 0.6)
    p3 = (x2 - ux * size - px * size * 0.6, y2 - uy * size - py * size * 0.6)
    draw.polygon([p1, p2, p3], fill=color)


def header(draw, title, subtitle):
    draw.rectangle((0, 0, W, 110), fill=NAVY)
    draw.text((70, 25), title, font=font(36, True), fill=WHITE)
    draw.text((72, 70), subtitle, font=font(18), fill=(210, 218, 230))


def interactions():
    image = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(image)
    header(
        draw,
        "Hutchrok Agent Command Center — Interaction Map",
        "One recommendation engine, verified context, server-only ledger, human authority",
    )

    rounded_box(draw, (70, 190, 360, 350), "Hutchrok Operator", "Bearer-authenticated\nadmin request")
    rounded_box(draw, (455, 175, 760, 365), "Next.js Agent API", "Validate task\nRate limit\nEnforce authority boundary", fill=WHITE)
    rounded_box(draw, (855, 160, 1190, 380), "Verified Context Loader", "Supabase allowlist\nNo contact data\nNo raw documents", fill=WHITE)
    rounded_box(draw, (1270, 190, 1530, 350), "OpenAI Agent", "Structured Zod output\nRecommendations only", fill=WHITE)

    rounded_box(draw, (435, 535, 770, 735), "Agent Task Ledger", "Idempotency\nStatus + duration\nRedacted input/output", fill=WHITE)
    rounded_box(draw, (860, 535, 1195, 735), "Human Approval Gate", "Approve / reject / cancel\nNo side effect execution", fill=WHITE)
    rounded_box(draw, (1270, 550, 1530, 720), "External Action", "Filing, message, payment,\nrecord change", fill=(250, 239, 239), outline=(220, 170, 170), title_fill=RED)

    arrow(draw, (360, 270), (455, 270))
    arrow(draw, (760, 270), (855, 270))
    arrow(draw, (1190, 270), (1270, 270))
    arrow(draw, (1400, 350), (1030, 535))
    arrow(draw, (855, 635), (770, 635), color=GREEN)
    arrow(draw, (770, 635), (860, 635), color=GOLD)
    arrow(draw, (1195, 635), (1270, 635), color=RED)

    draw.text((70, 805), "AUTOMATION STOPS HERE", font=font(21, True), fill=RED)
    draw.line((310, 820, 1530, 820), fill=RED, width=4)
    draw.text(
        (70, 842),
        "Approval records a decision only. Filing, sending, charging, and record changes remain separate human-controlled workflows.",
        font=font(18),
        fill=NAVY,
    )

    image.save(DOCS / "agent-interactions.png", optimize=True)


def sequence():
    image = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(image)
    header(
        draw,
        "Hutchrok Agent Command Center — Task Sequence",
        "Synchronous first release with idempotency, redaction, and explicit approval",
    )

    lanes = [
        (120, "Operator"),
        (400, "Next.js API"),
        (680, "Supabase"),
        (960, "OpenAI Agent"),
        (1240, "Approval Gate"),
    ]
    for x, label in lanes:
        draw.text((x - 55, 135), label, font=font(22, True), fill=NAVY)
        draw.line((x, 180, x, 820), fill=LIGHT, width=3)

    steps = [
        (225, 120, 400, "1. POST task + bearer token", GOLD),
        (300, 400, 680, "2. Read definition + idempotency", NAVY),
        (375, 680, 400, "3. Return registry / existing task", NAVY),
        (450, 400, 680, "4. Load allowlisted subject facts", GREEN),
        (525, 680, 400, "5. Return minimized facts", GREEN),
        (600, 400, 960, "6. Send redacted prompt", GOLD),
        (675, 960, 400, "7. Structured recommendation", GOLD),
        (750, 400, 680, "8. Persist waiting_approval", NAVY),
        (815, 400, 1240, "9. Return task for human review", RED),
    ]

    for y, x1, x2, label, color in steps:
        arrow(draw, (x1, y), (x2, y), color=color, width=5)
        mid = min(x1, x2) + abs(x2 - x1) / 2
        draw.rounded_rectangle(
            (mid - 150, y - 31, mid + 150, y - 5),
            radius=10,
            fill=WHITE,
        )
        draw.text((mid - 142, y - 30), label, font=font(15, True), fill=NAVY)

    image.save(DOCS / "agent-sequence.png", optimize=True)


if __name__ == "__main__":
    interactions()
    sequence()
    print("Generated agent-interactions.png and agent-sequence.png")
