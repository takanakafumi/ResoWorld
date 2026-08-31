# Local geography data

`east-asia-110m.geo.json` is a derived subset containing Japan and South Korea
from Natural Earth `ne_110m_admin_0_countries`.

- Upstream: https://github.com/nvkelso/natural-earth-vector
- Dataset page: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/
- Retrieved: 2026-08-31
- Transformation: selected features whose `ADMIN` is `Japan` or `South Korea`;
  geometry and upstream properties were otherwise retained.
- Runtime network access: none

Natural Earth states that its raster and vector map data are in the public
domain: https://www.naturalearthdata.com/about/terms-of-use/

The background is for geographic orientation, not for resolving disputed
boundaries or validating ancient-place identifications.
