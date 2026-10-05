(function () {
  function cross(opts) {
    const o = opts || {};
    const stroke = o.stroke || "#f4f4f4";
    const sw = o.sw || 3;
    const cls = o.className || "orthodox-cross";
    const w = o.width || 64;
    const useLen = o.pathLength !== false;
    const plen = useLen ? ' pathLength="100"' : "";
    return (
      '<svg class="' +
      cls +
      '" viewBox="0 0 80 120" width="' +
      w +
      '" height="' +
      Math.round(w * 1.5) +
      '" aria-hidden="true" fill="none" stroke="' +
      stroke +
      '" stroke-width="' +
      sw +
      '" stroke-linecap="square">' +
      "<path" +
      plen +
      ' d="M40 4 V116"/>' +
      "<path" +
      plen +
      ' d="M27 18 H53"/>' +
      "<path" +
      plen +
      ' d="M6 42 H74"/>' +
      "<path" +
      plen +
      ' d="M16 88 L64 102"/>' +
      "</svg>"
    );
  }

  function clothGrad(id, cloth) {
    if (cloth === "bone") {
      return (
        '<linearGradient id="cloth-' +
        id +
        '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#f4ead7"/>' +
        '<stop offset="0.5" stop-color="#e4d4b8"/>' +
        '<stop offset="1" stop-color="#cbb892"/>' +
        "</linearGradient>"
      );
    }
    return (
      '<linearGradient id="cloth-' +
      id +
      '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#4a4034"/>' +
      '<stop offset="0.42" stop-color="#1c1814"/>' +
      '<stop offset="1" stop-color="#0c0b0a"/>' +
      "</linearGradient>"
    );
  }

  function teePath() {
    return "M28 132 L108 78 L150 118 L210 118 L252 78 L332 132 L292 214 L252 186 L240 400 L120 400 L108 186 L68 214 Z";
  }

  function hoodiePath() {
    return "M128 168 C128 168 92 150 70 168 L18 210 L42 286 L96 252 L108 404 L252 404 L264 252 L318 286 L342 210 L290 168 C268 150 232 168 232 168 C210 188 150 188 128 168 Z";
  }

  function hoodPath() {
    return "M118 176 C86 168 78 70 180 36 C282 70 274 168 242 176 C214 198 146 198 118 176 Z";
  }

  function print(art, ink, accent) {
    if (art === "hood") return hoodPrint(ink);
    if (art === "golgotha") return golgothaPrint(ink);
    if (art === "warfare") return warPrint(ink);
    if (art === "soldier") return soldierPrint(ink);
    if (art === "shepherd") return shepherdPrint(ink);
    if (art === "withyou") return withYouPrint();
    return soonPrint(ink, accent);
  }

  function hoodPrint(ink) {
    return (
      '<g fill="none" stroke="' +
      ink +
      '" stroke-width="3" stroke-linejoin="round">' +
      '<path d="M46 78 C46 18 154 18 154 78 L168 188 H32 Z" fill="' +
      ink +
      '" fill-opacity=".08"/>' +
      '<path d="M72 86 C78 58 122 58 128 86"/>' +
      '<path d="M58 80 l10 10 8-14 10 16 8-16 10 16 8-16 10 16 8-12"/>' +
      '<path d="M100 96 V170 M86 112 H114 M62 132 H138 M74 156 L126 168"/>' +
      '<path d="M40 188 H160"/>' +
      '<text x="34" y="128" fill="' +
      ink +
      '" stroke="none" font-size="16" font-family="serif">ІС</text>' +
      '<text x="148" y="128" fill="' +
      ink +
      '" stroke="none" font-size="16" font-family="serif">ХС</text>' +
      "</g>"
    );
  }

  function golgothaPrint(ink) {
    return (
      '<g fill="none" stroke="' +
      ink +
      '" stroke-width="5" stroke-linecap="square">' +
      '<path d="M100 8 V168"/>' +
      '<path d="M72 34 H128"/>' +
      '<path d="M28 68 H172"/>' +
      '<path d="M48 132 L152 156" stroke-width="4"/>' +
      '<circle cx="100" cy="178" r="14" fill="' +
      ink +
      '" stroke="none"/>' +
      '<circle cx="94" cy="175" r="2.2" fill="#1a120c" stroke="none"/>' +
      '<circle cx="106" cy="175" r="2.2" fill="#1a120c" stroke="none"/>' +
      '<text x="18" y="40" fill="' +
      ink +
      '" stroke="none" font-size="20" font-family="serif">ІС</text>' +
      '<text x="158" y="40" fill="' +
      ink +
      '" stroke="none" font-size="20" font-family="serif">ХС</text>' +
      '<text x="72" y="104" fill="' +
      ink +
      '" stroke="none" font-size="16" font-family="serif">НИКА</text>' +
      "</g>"
    );
  }

  function warPrint(ink) {
    return (
      '<g fill="none" stroke="' +
      ink +
      '" stroke-width="3">' +
      '<path d="M62 48 C62 16 138 16 138 48 L148 64 L140 150 H60 L52 64 Z"/>' +
      '<circle cx="100" cy="62" r="12"/>' +
      '<path d="M100 8 V186" stroke-width="4"/>' +
      '<path d="M78 28 H122"/>' +
      '<path d="M18 156 C50 140 78 178 100 164 C130 146 160 176 186 154" stroke-width="4"/>' +
      '<path d="M168 148 l16 2 -6 12 z" fill="' +
      ink +
      '"/>' +
      '<path d="M70 128 H130" stroke-width="2"/>' +
      "</g>"
    );
  }

  function soldierPrint(ink) {
    return (
      '<g fill="none" stroke="' +
      ink +
      '" stroke-width="3" stroke-linejoin="round">' +
      '<path d="M16 168 L58 96 L92 124 L140 62 L184 118 L196 168"/>' +
      '<path d="M70 24 V168" stroke-width="5"/>' +
      '<path d="M42 52 H98"/>' +
      '<path d="M24 86 H116"/>' +
      '<path d="M48 132 L92 148" stroke-width="4"/>' +
      '<rect x="128" y="108" width="58" height="48" fill="' +
      ink +
      '" fill-opacity=".08"/>' +
      '<path d="M128 108 L157 88 L186 108"/>' +
      '<path d="M157 116 V146 M142 131 H172"/>' +
      "</g>"
    );
  }

  function shepherdPrint(ink) {
    return (
      '<g fill="none" stroke="' +
      ink +
      '" stroke-width="3">' +
      '<path d="M18 176 H188"/>' +
      '<path d="M24 176 C60 132 90 146 118 176"/>' +
      '<path d="M128 28 C128 8 162 0 172 22 C186 2 208 28 194 46" stroke-width="4"/>' +
      '<path d="M128 36 V184" stroke-width="4"/>' +
      '<path d="M28 156 c20 -22 36 -20 48 2 v18 h-48 z" fill="' +
      ink +
      '" fill-opacity=".2"/>' +
      '<path d="M78 146 c22 -24 40 -16 50 4 v22 h-50 z" fill="' +
      ink +
      '" fill-opacity=".2"/>' +
      '<path d="M136 160 c16 -18 32 -14 40 2 v16 h-40 z" fill="' +
      ink +
      '" fill-opacity=".2"/>' +
      '<circle cx="58" cy="150" r="4" fill="' +
      ink +
      '" stroke="none"/>' +
      '<circle cx="112" cy="140" r="4" fill="' +
      ink +
      '" stroke="none"/>' +
      '<circle cx="164" cy="154" r="4" fill="' +
      ink +
      '" stroke="none"/>' +
      "</g>"
    );
  }

  function withYouPrint() {
    const gold = "#f4f4f4";
    const red = "#d0d0d0";
    const blue = "#f4f4f4";
    const bone = "#f4f4f4";
    return (
      '<g>' +
      '<path d="M8 188 L62 112 L108 136 L156 78 L210 126 L214 188 Z" fill="#1a1a1a" stroke="#f4f4f4"/>' +
      '<path d="M8 188 H214" stroke="' +
      gold +
      '" stroke-width="2"/>' +
      '<g transform="translate(62 8)">' +
      '<circle cx="36" cy="28" r="22" fill="none" stroke="' +
      gold +
      '" stroke-width="2"/>' +
      '<path d="M36 8 V48 M16 26 H56" stroke="' +
      gold +
      '" stroke-width="2"/>' +
      '<circle cx="36" cy="28" r="7" fill="' +
      bone +
      '"/>' +
      '<path d="M18 54 H54 L62 168 H10 Z" fill="' +
      red +
      '"/>' +
      '<path d="M6 66 H66 L54 172 H18 Z" fill="' +
      blue +
      '"/>' +
      '<path d="M36 66 V168 M20 100 H52" stroke="' +
      gold +
      '" stroke-width="1.2" opacity=".8"/>' +
      "</g>" +
      '<g transform="translate(8 78)">' +
      '<circle cx="20" cy="12" r="10" fill="' +
      bone +
      '"/>' +
      '<path d="M4 28 H36 L30 108 H8 Z" fill="#f4f4f4"/>' +
      "</g>" +
      '<g transform="translate(156 92)">' +
      '<circle cx="18" cy="10" r="9" fill="' +
      bone +
      '"/>' +
      '<path d="M2 24 H34 L28 96 H6 Z" fill="#bdbdbd"/>' +
      "</g>" +
      "</g>"
    );
  }

  function soonPrint(ink) {
    return (
      '<g fill="none" stroke="' +
      ink +
      '" stroke-width="1.2" opacity=".55">' +
      '<path d="M100 30 V150 M70 50 H130 M55 78 H145 M72 112 L128 124"/>' +
      '<circle cx="100" cy="100" r="46"/>' +
      "</g>"
    );
  }

  let garmentSeq = 0;

  function garment(product) {
    return (
      '<svg class="garment" viewBox="-8 -4 230 214" role="img" aria-label="' +
      product.ru +
      '">' +
      print(product.art, "#f4f4f4") +
      "</svg>"
    );
  }

  window.OGArt = { cross: cross, garment: garment };
})();
