import math
import struct
import os

def rotate_point(p, rx=0.0, ry=0.0, rz=0.0):
    x, y, z = p
    if rx:
        c, s = math.cos(rx), math.sin(rx)
        y, z = y * c - z * s, y * s + z * c
    if ry:
        c, s = math.cos(ry), math.sin(ry)
        x, z = x * c + z * s, -x * s + z * c
    if rz:
        c, s = math.cos(rz), math.sin(rz)
        x, y = x * c - y * s, x * s + y * c
    return (x, y, z)

def translate_point(p, tx=0.0, ty=0.0, tz=0.0):
    return (p[0] + tx, p[1] + ty, p[2] + tz)

def transform_mesh(tris, rx=0.0, ry=0.0, rz=0.0, tx=0.0, ty=0.0, tz=0.0):
    out = []
    for v1, v2, v3 in tris:
        p1 = translate_point(rotate_point(v1, rx, ry, rz), tx, ty, tz)
        p2 = translate_point(rotate_point(v2, rx, ry, rz), tx, ty, tz)
        p3 = translate_point(rotate_point(v3, rx, ry, rz), tx, ty, tz)
        out.append((p1, p2, p3))
    return out

def catmull_rom_spline(points, subdivisions=8):
    """Smoothly interpolates a list of (r, y) points using Catmull-Rom splines."""
    if len(points) < 3:
        return points
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for s in range(subdivisions):
            t = s / float(subdivisions)
            t2 = t * t
            t3 = t2 * t
            r = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
                       (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                       (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
                       (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                       (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((max(0.0, r), y))
    out.append(points[-1])
    return out

def lathe_geometry(profile, segments=96):
    """
    Revolves a bottom-to-top (r, y) profile around the Y axis with strictly
    OUTWARD-facing counter-clockwise triangle winding for Three.js FrontSide.
    """
    tris = []
    for i in range(segments):
        a1 = 2.0 * math.pi * i / segments
        a2 = 2.0 * math.pi * (i + 1) / segments
        c1, s1 = math.cos(a1), math.sin(a1)
        c2, s2 = math.cos(a2), math.sin(a2)

        for j in range(len(profile) - 1):
            r1, y1 = profile[j]
            r2, y2 = profile[j + 1]
            if abs(r1 - r2) < 1e-7 and abs(y1 - y2) < 1e-7:
                continue

            p1 = (r1 * c1, y1, r1 * s1)
            p2 = (r1 * c2, y1, r1 * s2)
            p3 = (r2 * c2, y2, r2 * s2)
            p4 = (r2 * c1, y2, r2 * s1)

            # Counter-clockwise outward winding when traversing bottom -> top
            if r1 > 1e-6:
                tris.append((p1, p3, p2))
            if r2 > 1e-6:
                tris.append((p1, p4, p3))
    return tris

def compute_normal(v1, v2, v3):
    ux, uy, uz = v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]
    vx, vy, vz = v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]
    nx = uy * vz - uz * vy
    ny = uz * vx - ux * vz
    nz = ux * vy - uy * vx
    length = math.sqrt(nx * nx + ny * ny + nz * nz)
    if length < 1e-9:
        return (0.0, 1.0, 0.0)
    return (nx / length, ny / length, nz / length)

def write_binary_stl(filename, triangles):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "wb") as f:
        header = b"LEX VERA High-Poly Manifold STL Asset".ljust(80, b"\x00")
        f.write(header)
        f.write(struct.pack("<I", len(triangles)))
        for v1, v2, v3 in triangles:
            n = compute_normal(v1, v2, v3)
            f.write(struct.pack("<12fH",
                n[0], n[1], n[2],
                v1[0], v1[1], v1[2],
                v2[0], v2[1], v2[2],
                v3[0], v3[1], v3[2],
                0
            ))
    print(f"Generated: {filename} ({len(triangles)} tris)")

# ==============================================================================
# 1. SCULPTED CEREMONIAL MALLET HEAD (Vertical along Y so bottom strikes block)
# ==============================================================================
lower_barrel_curve = catmull_rom_spline([
    (0.64, -1.36), (0.68, -1.26), (0.65, -1.14), (0.55, -1.04),
    (0.51, -0.82), (0.54, -0.55), (0.56, -0.34)
], subdivisions=10)

upper_barrel_curve = [(r, -y) for r, y in reversed(lower_barrel_curve)]

head_profile = (
    [
        # Slightly crowned bottom striking face with 3-step micro-bevel
        (0.0, -1.46), (0.35, -1.455), (0.58, -1.44),
        (0.61, -1.425), (0.63, -1.40)
    ]
    + lower_barrel_curve
    + [
        # Recessed center waist channel for the brass band
        (0.54, -0.32), (0.54, 0.32)
    ]
    + upper_barrel_curve
    + [
        # Micro-beveled top striking face
        (0.63, 1.40), (0.61, 1.425), (0.58, 1.44),
        (0.35, 1.455), (0.0, 1.46)
    ]
)
raw_head = lathe_geometry(head_profile, segments=96)

# ==============================================================================
# 2. SOLID MANIFOLD BRASS BAND + TRIM RINGS + PERPENDICULAR HANDLE SOCKET
# ==============================================================================
# Center decorative waist collar (closed solid manifold loop)
center_collar_outer = catmull_rom_spline([
    (0.575, -0.32), (0.605, -0.27), (0.585, -0.18),
    (0.595, 0.0), (0.585, 0.18), (0.605, 0.27), (0.575, 0.32)
], subdivisions=8)

center_collar_profile = (
    [(0.535, -0.33), (0.565, -0.33)]
    + center_collar_outer
    + [(0.565, 0.33), (0.535, 0.33), (0.535, -0.33)]
)

# Upper & Lower thin decorative brass inlay rings near the barrel ends
def make_trim_ring(y_center):
    return lathe_geometry([
        (0.53, y_center - 0.035), (0.575, y_center - 0.035),
        (0.59, y_center - 0.015), (0.59, y_center + 0.015),
        (0.575, y_center + 0.035), (0.53, y_center + 0.035),
        (0.53, y_center - 0.035)
    ], segments=96)

# Perpendicular brass ferrule socket where the handle plugs into the mallet head (-X axis)
ferrule_curve = catmull_rom_spline([
    (0.28, -0.92), (0.24, -0.84), (0.21, -0.72),
    (0.22, -0.60), (0.26, -0.52)
], subdivisions=8)
ferrule_profile = [(0.0, -0.92)] + ferrule_curve + [(0.0, -0.52)]
# Rotate ferrule so its axis points along -X
raw_ferrule = transform_mesh(lathe_geometry(ferrule_profile, segments=72), rz=-math.pi / 2)

raw_band = (
    lathe_geometry(center_collar_profile, segments=96)
    + make_trim_ring(-1.02)
    + make_trim_ring(1.02)
    + raw_ferrule
)

# ==============================================================================
# 3. TURNED BALUSTER WOODEN HANDLE (Extends along -X perpendicular to head)
# ==============================================================================
handle_spline = catmull_rom_spline([
    # Sculpted acorn pommel finial at grip end (-4.75)
    (0.12, -4.72), (0.22, -4.64), (0.20, -4.54),
    (0.32, -4.38), (0.35, -4.22), (0.29, -4.05),
    # Deep cove neck above pommel
    (0.19, -3.85), (0.21, -3.65),
    # Ergonomic palm swell along main grip
    (0.26, -3.20), (0.27, -2.65), (0.23, -2.10),
    # Tapered shaft & decorative bead before entering brass ferrule
    (0.17, -1.55), (0.16, -1.15), (0.21, -0.98), (0.18, -0.90)
], subdivisions=10)

handle_profile = (
    [(0.0, -4.75), (0.08, -4.74)]
    + handle_spline
    + [(0.17, -0.55), (0.0, -0.55)]
)
# Rotate -90 deg around Z so handle extends along -X (from x=-0.55 to x=-4.75)
raw_handle = transform_mesh(lathe_geometry(handle_profile, segments=96), rz=-math.pi / 2)

# ==============================================================================
# 4. MONUMENTAL MULTI-TIERED SOUND BLOCK (Solid manifold, flat bottom, domed top)
# ==============================================================================
block_molding = catmull_rom_spline([
    (1.94, -0.42), (1.82, -0.34), (1.78, -0.24),
    (1.66, -0.14), (1.62, -0.02), (1.48, 0.08), (1.36, 0.14)
], subdivisions=10)

block_profile = (
    [
        # Solid closed flat bottom disk with micro-bevel
        (0.0, -0.52), (1.40, -0.52), (1.90, -0.52),
        (1.94, -0.50), (1.95, -0.46)
    ]
    + block_molding
    + [
        # Slightly domed top anvil striking plateau with crisp bevel
        (1.32, 0.17), (1.25, 0.185), (0.65, 0.195), (0.0, 0.20)
    ]
)
raw_block = lathe_geometry(block_profile, segments=96)

# Concentric Impact Shockwave Ring (Closed solid torus profile for Stage 4)
ring_profile = [
    (2.15, -0.50), (2.30, -0.50), (2.36, -0.44),
    (2.30, -0.38), (2.15, -0.38), (2.09, -0.44), (2.15, -0.50)
]
raw_shockwave = lathe_geometry(ring_profile, segments=96)

# ==============================================================================
# 5. WRITE MODULAR & PRE-POSED STAGE STL FILES
# ==============================================================================
for base_dir in ["stl_assets", "public/stl_assets"]:
    write_binary_stl(f"{base_dir}/modular/part_gavel_head.stl", raw_head)
    write_binary_stl(f"{base_dir}/modular/part_brass_band.stl", raw_band)
    write_binary_stl(f"{base_dir}/modular/part_gavel_handle.stl", raw_handle)
    write_binary_stl(f"{base_dir}/modular/part_sound_block.stl", raw_block)

    def pose_gavel(angle_deg, lift_y, explode=0.0):
        rad = math.radians(angle_deg)
        head = transform_mesh(raw_head, ty=explode * 1.1)
        band = transform_mesh(raw_band, tz=explode * 1.3)
        handle = transform_mesh(raw_handle, tx=-explode * 1.6)
        combined = head + band + handle
        pivoted = transform_mesh(combined, tx=4.4)
        pivoted = transform_mesh(pivoted, rz=rad, tx=-4.4, ty=lift_y)
        return pivoted

    # Contact offset calculation:
    # Head lower striking face is at Y = -1.460
    # Sound block top anvil plateau is at Y = 0.200
    # With sound block at ty = -1.50, block striking plateau is at Y = -1.300
    # Exact contact at angle 0 deg requires lift_y = -1.300 - (-1.460) = +0.160
    stage_1 = pose_gavel(25, 2.36, explode=1.0) + transform_mesh(raw_block, ty=-1.5)
    stage_2 = pose_gavel(42, 1.56, explode=0.0) + transform_mesh(raw_block, ty=-1.5)
    stage_3 = pose_gavel(14, 0.56, explode=0.0) + transform_mesh(raw_block, ty=-1.5)
    stage_4 = (
        pose_gavel(0, 0.16, explode=0.0)
        + transform_mesh(raw_block, ty=-1.5)
        + transform_mesh(raw_shockwave, ty=-1.5)
    )

    write_binary_stl(f"{base_dir}/stages/stage_1_exploded.stl", stage_1)
    write_binary_stl(f"{base_dir}/stages/stage_2_raised.stl", stage_2)
    write_binary_stl(f"{base_dir}/stages/stage_3_mid_swing.stl", stage_3)
    write_binary_stl(f"{base_dir}/stages/stage_4_impact.stl", stage_4)
