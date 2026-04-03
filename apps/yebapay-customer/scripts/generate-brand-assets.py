from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
IMAGES = ASSETS / "images"
BRAND = ASSETS / "brand"
ONBOARDING = ASSETS / "onboarding"


PALETTE = {
    "ink": "#12312E",
    "palm": "#1E6B5B",
    "sand": "#F4E8D1",
    "mist": "#EEF5F1",
    "sun": "#D79A2B",
    "clay": "#D85C34",
    "cloud": "#FAFAF7",
    "slate": "#667874",
    "black": "#0E1513",
    "white": "#FFFFFF",
}


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip("#")
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
        alpha,
    )


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def vertical_gradient(size: tuple[int, int], top: str, bottom: str) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    draw = ImageDraw.Draw(image)
    top_rgba = rgba(top)
    bottom_rgba = rgba(bottom)
    for y in range(height):
        ratio = y / max(1, height - 1)
        color = tuple(
            int(top_rgba[index] * (1.0 - ratio) + bottom_rgba[index] * ratio)
            for index in range(4)
        )
        draw.line((0, y, width, y), fill=color)
    return image


def add_orb(
    base: Image.Image,
    box: tuple[int, int, int, int],
    color: str,
    alpha: int,
    blur: int,
) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse(box, fill=rgba(color, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(overlay)


def add_card_shadow(
    base: Image.Image,
    box: tuple[int, int, int, int],
    radius: int,
    color: str = PALETTE["ink"],
    alpha: int = 42,
    blur: int = 28,
    offset: tuple[int, int] = (0, 18),
) -> None:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    shifted = (
        box[0] + offset[0],
        box[1] + offset[1],
        box[2] + offset[0],
        box[3] + offset[1],
    )
    draw.rounded_rectangle(shifted, radius=radius, fill=rgba(color, alpha))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow)


def draw_corner(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    length: float,
    thickness: float,
    horizontal_direction: int,
    vertical_direction: int,
    color: tuple[int, int, int, int],
) -> None:
    horizontal_end = x + (length * horizontal_direction)
    vertical_end = y + (length * vertical_direction)
    draw.rounded_rectangle(
        (
            min(x, horizontal_end),
            y,
            max(x, horizontal_end),
            y + thickness,
        ),
        radius=thickness / 2,
        fill=color,
    )
    draw.rounded_rectangle(
        (
            x,
            min(y, vertical_end),
            x + thickness,
            max(y, vertical_end),
        ),
        radius=thickness / 2,
        fill=color,
    )


def draw_mark(
    base: Image.Image,
    box: tuple[int, int, int, int],
    *,
    card_fill: str | None,
    corner_color: str,
    y_color: str,
    dot_color: str,
    hole_color: tuple[int, int, int, int],
    transparent_hole: bool = False,
) -> None:
    draw = ImageDraw.Draw(base)
    x0, y0, x1, y1 = box
    size = min(x1 - x0, y1 - y0)
    radius = int(size * 0.23)

    if card_fill is not None:
        draw.rounded_rectangle(box, radius=radius, fill=rgba(card_fill))

    inset = size * 0.11
    length = size * 0.18
    thickness = max(6, int(size * 0.04))
    corner_fill = rgba(corner_color)

    draw_corner(draw, x0 + inset, y0 + inset, length, thickness, 1, 1, corner_fill)
    draw_corner(draw, x1 - inset - length, y0 + inset, length, thickness, 1, 1, corner_fill)
    draw_corner(draw, x0 + inset, y1 - inset - thickness, length, thickness, 1, -1, corner_fill)
    draw_corner(draw, x1 - inset - length, y1 - inset - thickness, length, thickness, 1, -1, corner_fill)

    font = load_font(int(size * 0.47), bold=True)
    center_x = (x0 + x1) / 2
    center_y = (y0 + y1) / 2 + size * 0.02
    draw.text(
        (center_x, center_y),
        "Y",
        fill=rgba(y_color),
        font=font,
        anchor="mm",
    )

    dot_radius = size * 0.065
    dot_center = (x0 + size * 0.72, y0 + size * 0.44)
    draw.ellipse(
        (
            dot_center[0] - dot_radius,
            dot_center[1] - dot_radius,
            dot_center[0] + dot_radius,
            dot_center[1] + dot_radius,
        ),
        fill=rgba(dot_color),
    )

    hole_radius = dot_radius * 0.32
    if transparent_hole:
        hole = Image.new("RGBA", base.size, (0, 0, 0, 0))
        hole_draw = ImageDraw.Draw(hole)
        hole_draw.ellipse(
            (
                dot_center[0] - hole_radius,
                dot_center[1] - hole_radius,
                dot_center[0] + hole_radius,
                dot_center[1] + hole_radius,
            ),
            fill=(0, 0, 0, 0),
        )
        mask = Image.new("L", base.size, 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse(
            (
                dot_center[0] - hole_radius,
                dot_center[1] - hole_radius,
                dot_center[0] + hole_radius,
                dot_center[1] + hole_radius,
            ),
            fill=255,
        )
        base.paste(hole, mask=mask)
    else:
        draw.ellipse(
            (
                dot_center[0] - hole_radius,
                dot_center[1] - hole_radius,
                dot_center[0] + hole_radius,
                dot_center[1] + hole_radius,
            ),
            fill=hole_color,
        )


def make_icon(size: int) -> Image.Image:
    canvas = vertical_gradient((size, size), PALETTE["ink"], PALETTE["palm"])
    add_orb(canvas, (-size // 8, -size // 8, size // 2, size // 2), PALETTE["sun"], 78, size // 16)
    add_orb(canvas, (size // 2, size // 2, size + size // 6, size + size // 6), PALETTE["sand"], 92, size // 12)

    inset = int(size * 0.11)
    box = (inset, inset, size - inset, size - inset)
    add_card_shadow(canvas, box, radius=int(size * 0.23))
    draw_mark(
        canvas,
        box,
        card_fill=PALETTE["cloud"],
        corner_color=PALETTE["ink"],
        y_color=PALETTE["palm"],
        dot_color=PALETTE["sun"],
        hole_color=rgba(PALETTE["cloud"]),
    )
    return canvas


def make_splash(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    box = (int(size * 0.19), int(size * 0.19), int(size * 0.81), int(size * 0.81))
    add_card_shadow(canvas, box, radius=int(size * 0.14), alpha=32, blur=size // 26, offset=(0, 10))
    draw_mark(
        canvas,
        box,
        card_fill=PALETTE["cloud"],
        corner_color=PALETTE["ink"],
        y_color=PALETTE["palm"],
        dot_color=PALETTE["sun"],
        hole_color=rgba(PALETTE["cloud"]),
    )
    return canvas


def make_adaptive_background(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), rgba(PALETTE["cloud"]))
    add_orb(canvas, (-size // 5, size // 2 - size // 6, size // 2, size + size // 10), PALETTE["sand"], 180, size // 10)
    add_orb(canvas, (size // 2, -size // 6, size + size // 8, size // 2), PALETTE["mist"], 240, size // 12)
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width = max(10, size // 32)
    draw.arc(
        (-size // 6, size // 3, size // 2, size + size // 6),
        start=300,
        end=60,
        fill=rgba(PALETTE["palm"], 72),
        width=width,
    )
    draw.arc(
        (size // 2 - size // 10, -size // 8, size + size // 5, size // 2 + size // 6),
        start=120,
        end=250,
        fill=rgba(PALETTE["ink"], 34),
        width=width,
    )
    canvas.alpha_composite(overlay)
    return canvas


def make_foreground(size: int, monochrome: bool = False) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inset = int(size * 0.16)
    box = (inset, inset, size - inset, size - inset)
    draw_mark(
        canvas,
        box,
        card_fill=None,
        corner_color=PALETTE["black"] if monochrome else PALETTE["ink"],
        y_color=PALETTE["black"] if monochrome else PALETTE["palm"],
        dot_color=PALETTE["black"] if monochrome else PALETTE["sun"],
        hole_color=(0, 0, 0, 0),
        transparent_hole=True,
    )
    return canvas


def make_logo(size: int) -> Image.Image:
    return make_foreground(size, monochrome=False)


def make_partial_banner(width: int, height: int) -> Image.Image:
    canvas = Image.new("RGBA", (width, height), rgba(PALETTE["cloud"]))
    add_orb(canvas, (-width // 8, -height // 3, width // 2, height // 2), PALETTE["sand"], 210, 28)
    add_orb(canvas, (width // 2, height // 3, width + width // 5, height + height // 2), PALETTE["mist"], 220, 26)

    draw = ImageDraw.Draw(canvas)
    headline_font = load_font(48, bold=True)
    body_font = load_font(22, bold=False)

    draw.text((32, 42), "YebaPay", fill=rgba(PALETTE["ink"]), font=headline_font)
    draw.text(
        (36, 98),
        "Scanne. Paye. C'est regle.",
        fill=rgba(PALETTE["palm"]),
        font=body_font,
    )

    right_box = (width - 238, 18, width + 64, height + 90)
    draw_mark(
        canvas,
        right_box,
        card_fill=None,
        corner_color=PALETTE["ink"],
        y_color=PALETTE["palm"],
        dot_color=PALETTE["sun"],
        hole_color=rgba(PALETTE["cloud"]),
    )
    return canvas


def make_wordmark(width: int, height: int) -> Image.Image:
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    badge_size = min(height - 80, 360)
    badge_y = (height - badge_size) // 2
    badge_box = (60, badge_y, 60 + badge_size, badge_y + badge_size)
    draw_mark(
        canvas,
        badge_box,
        card_fill=PALETTE["cloud"],
        corner_color=PALETTE["ink"],
        y_color=PALETTE["palm"],
        dot_color=PALETTE["sun"],
        hole_color=rgba(PALETTE["cloud"]),
    )

    draw = ImageDraw.Draw(canvas)
    title_font = load_font(180, bold=True)
    subtitle_font = load_font(46, bold=False)
    text_x = badge_box[2] + 56
    title_y = badge_y + 34
    draw.text((text_x, title_y), "YebaPay", fill=rgba(PALETTE["ink"]), font=title_font)
    draw.text(
        (text_x + 8, title_y + 190),
        "Le wallet QR du quotidien.",
        fill=rgba(PALETTE["palm"]),
        font=subtitle_font,
    )
    return canvas


def make_onboarding_city(width: int, height: int) -> Image.Image:
    canvas = vertical_gradient((width, height), "#8C979C", "#12191B")
    add_orb(canvas, (-width // 6, -height // 8, width // 2, height // 3), "#D8E3E8", 120, 58)
    add_orb(canvas, (width // 2, height // 2, width + width // 8, height + height // 5), PALETTE["sun"], 70, 120)
    draw = ImageDraw.Draw(canvas)

    draw.polygon(
        [
            (width * 0.28, height * 0.36),
            (width * 0.54, height * 0.18),
            (width * 0.72, height * 0.68),
            (width * 0.42, height * 0.82),
        ],
        fill=rgba("#1B2326", 255),
    )
    draw.polygon(
        [
            (width * 0.0, height * 0.28),
            (width * 0.26, height * 0.25),
            (width * 0.34, height * 0.86),
            (width * 0.0, height * 0.9),
        ],
        fill=rgba("#2B3438", 255),
    )
    draw.polygon(
        [
            (width * 0.68, height * 0.22),
            (width * 1.0, height * 0.18),
            (width * 1.0, height * 0.86),
            (width * 0.74, height * 0.82),
        ],
        fill=rgba("#232B2F", 255),
    )

    for row in range(11):
        for col in range(5):
            x = width * 0.44 + col * width * 0.045
            y = height * 0.31 + row * height * 0.038
            draw.rounded_rectangle(
                (x, y, x + width * 0.022, y + height * 0.014),
                radius=3,
                fill=rgba("#B8D1D6", 70 if (row + col) % 2 else 110),
            )

    for row in range(14):
        for col in range(3):
            x = width * 0.08 + col * width * 0.07
            y = height * 0.34 + row * height * 0.034
            draw.rounded_rectangle(
                (x, y, x + width * 0.03, y + height * 0.012),
                radius=3,
                fill=rgba(PALETTE["sun"], 55 if row % 2 else 88),
            )

    draw.polygon(
        [
            (width * 0.34, height * 0.9),
            (width * 0.67, height * 0.76),
            (width * 0.82, height * 0.95),
            (width * 0.26, height * 1.02),
        ],
        fill=rgba("#2B1E12", 255),
    )

    overlay = Image.new("RGBA", (width, height), rgba("#081012", 88))
    canvas.alpha_composite(overlay)
    return canvas


def make_onboarding_wallet(width: int, height: int) -> Image.Image:
    canvas = vertical_gradient((width, height), "#0F1B1A", "#050809")
    add_orb(canvas, (-width // 7, height // 2, width // 2, height + height // 5), PALETTE["clay"], 68, 120)
    add_orb(canvas, (width // 2, -height // 8, width + width // 6, height // 2), PALETTE["mist"], 36, 96)
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle(
        (width * 0.57, height * 0.07, width * 1.02, height * 0.76),
        radius=int(width * 0.08),
        fill=rgba("#10181A", 245),
    )

    draw.ellipse(
        (width * 0.04, height * 0.32, width * 0.8, height * 0.98),
        fill=rgba("#7B5D47", 240),
    )
    draw.ellipse(
        (width * 0.14, height * 0.4, width * 0.92, height * 1.05),
        fill=rgba("#6C4F3D", 220),
    )

    wallet_box = (width * 0.36, height * 0.46, width * 0.82, height * 0.73)
    draw.rounded_rectangle(wallet_box, radius=int(width * 0.04), fill=rgba("#6A432A", 255))
    draw.rounded_rectangle(
        (width * 0.53, height * 0.54, width * 0.84, height * 0.76),
        radius=int(width * 0.04),
        fill=rgba("#5A341E", 255),
    )
    draw.rounded_rectangle(
        (width * 0.39, height * 0.5, width * 0.73, height * 0.59),
        radius=int(width * 0.018),
        fill=rgba("#D6C7A7", 250),
    )
    draw.text(
        (width * 0.44, height * 0.515),
        "YB 200",
        font=load_font(int(width * 0.038), bold=True),
        fill=rgba("#3D342F"),
    )
    draw.rounded_rectangle(
        (width * 0.38, height * 0.61, width * 0.68, height * 0.66),
        radius=int(width * 0.016),
        fill=rgba("#865739", 255),
    )

    draw.rounded_rectangle(
        (width * 0.61, height * 0.77, width * 0.79, height * 0.87),
        radius=int(width * 0.04),
        fill=rgba("#141E20", 255),
    )
    draw.rounded_rectangle(
        (width * 0.645, height * 0.805, width * 0.755, height * 0.84),
        radius=int(width * 0.01),
        fill=rgba(PALETTE["cloud"], 230),
    )

    overlay = Image.new("RGBA", (width, height), rgba("#071112", 62))
    canvas.alpha_composite(overlay)
    return canvas


def make_onboarding_scan(width: int, height: int) -> Image.Image:
    canvas = vertical_gradient((width, height), "#122421", "#091112")
    add_orb(canvas, (-width // 6, height // 4, width // 2, height * 0.8), PALETTE["mist"], 54, 94)
    add_orb(canvas, (width // 2, -height // 7, width + width // 5, height // 2), PALETTE["sun"], 64, 110)
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle(
        (width * 0.0, height * 0.74, width * 1.0, height * 1.02),
        radius=0,
        fill=rgba("#152523", 255),
    )
    draw.rounded_rectangle(
        (width * 0.16, height * 0.34, width * 0.62, height * 0.88),
        radius=int(width * 0.08),
        fill=rgba("#0D1517", 255),
        outline=rgba("#2D4540", 255),
        width=max(4, width // 120),
    )
    draw.rounded_rectangle(
        (width * 0.22, height * 0.42, width * 0.56, height * 0.77),
        radius=int(width * 0.04),
        fill=rgba("#F7F8F4", 245),
    )
    draw_mark(
        canvas,
        (int(width * 0.27), int(height * 0.49), int(width * 0.5), int(height * 0.72)),
        card_fill=None,
        corner_color=PALETTE["ink"],
        y_color=PALETTE["palm"],
        dot_color=PALETTE["sun"],
        hole_color=rgba(PALETTE["cloud"]),
    )

    qr_card = (width * 0.6, height * 0.48, width * 0.9, height * 0.78)
    draw.rounded_rectangle(qr_card, radius=int(width * 0.04), fill=rgba("#FBFAF7", 255))
    draw_mark(
        canvas,
        (int(width * 0.655), int(height * 0.545), int(width * 0.845), int(height * 0.735)),
        card_fill=None,
        corner_color=PALETTE["ink"],
        y_color=PALETTE["palm"],
        dot_color=PALETTE["sun"],
        hole_color=rgba(PALETTE["cloud"]),
    )

    draw.ellipse(
        (width * 0.72, height * 0.22, width * 1.06, height * 0.64),
        fill=rgba("#6D513C", 185),
    )

    overlay = Image.new("RGBA", (width, height), rgba("#071011", 58))
    canvas.alpha_composite(overlay)
    return canvas


def write_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG")


def main() -> None:
    write_png(make_icon(1024), IMAGES / "icon.png")
    write_png(make_splash(1024), IMAGES / "splash-icon.png")
    write_png(make_adaptive_background(512), IMAGES / "android-icon-background.png")
    write_png(make_foreground(512, monochrome=False), IMAGES / "android-icon-foreground.png")
    write_png(make_foreground(432, monochrome=True), IMAGES / "android-icon-monochrome.png")
    write_png(make_icon(48), IMAGES / "favicon.png")
    write_png(make_logo(100), IMAGES / "react-logo.png")
    write_png(make_logo(200), IMAGES / "react-logo@2x.png")
    write_png(make_logo(300), IMAGES / "react-logo@3x.png")
    write_png(make_partial_banner(518, 316), IMAGES / "partial-react-logo.png")
    write_png(make_icon(1024), BRAND / "yebapay-badge.png")
    write_png(make_wordmark(1600, 600), BRAND / "yebapay-wordmark.png")
    write_png(make_onboarding_city(1080, 2160), ONBOARDING / "slide-city.png")
    write_png(make_onboarding_wallet(1080, 2160), ONBOARDING / "slide-wallet.png")
    write_png(make_onboarding_scan(1080, 2160), ONBOARDING / "slide-scan.png")


if __name__ == "__main__":
    main()
