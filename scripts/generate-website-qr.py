"""Generate the permanent website QR assets.

Install once with: python -m pip install "qrcode[pil]"
Then run: python scripts/generate-website-qr.py
"""

from pathlib import Path
from xml.etree import ElementTree

import qrcode
from qrcode.image.svg import SvgPathImage


WEBSITE_URL = "https://gonuts.vn/"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "qr"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=48,
        border=4,
    )
    qr.add_data(WEBSITE_URL)
    qr.make(fit=True)

    qr.make_image(fill_color="black", back_color="white").save(
        OUTPUT_DIR / "gonuts-website.png"
    )
    svg_namespace = "http://www.w3.org/2000/svg"
    ElementTree.register_namespace("", svg_namespace)
    svg = ElementTree.fromstring(qr.make_image(image_factory=SvgPathImage).to_string())
    svg.insert(
        0,
        ElementTree.Element(
            f"{{{svg_namespace}}}rect",
            {"width": "100%", "height": "100%", "fill": "white"},
        ),
    )
    ElementTree.ElementTree(svg).write(
        OUTPUT_DIR / "gonuts-website.svg", encoding="utf-8", xml_declaration=True
    )


if __name__ == "__main__":
    main()
