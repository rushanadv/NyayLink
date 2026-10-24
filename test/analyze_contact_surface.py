import struct
import math

def read_stl_triangles(filepath):
    triangles = []
    with open(filepath, "rb") as f:
        f.read(80)
        num_triangles = struct.unpack("<I", f.read(4))[0]
        for _ in range(num_triangles):
            data = f.read(50)
            n = struct.unpack("<3f", data[0:12])
            v1 = struct.unpack("<3f", data[12:24])
            v2 = struct.unpack("<3f", data[24:36])
            v3 = struct.unpack("<3f", data[36:48])
            triangles.append((n, v1, v2, v3))
    return triangles

head_tris = read_stl_triangles("stl_assets/modular/part_gavel_head.stl")
block_tris = read_stl_triangles("stl_assets/modular/part_sound_block.stl")

# Analyze lower striking face of head (Y < -1.35)
head_bottom_pts = []
for n, v1, v2, v3 in head_tris:
    for v in (v1, v2, v3):
        if v[1] < -1.38:
            r = math.sqrt(v[0]**2 + v[2]**2)
            head_bottom_pts.append((r, v[1], v))

head_bottom_pts.sort(key=lambda p: p[1])
print(f"Lowest point on gavel head: Y = {head_bottom_pts[0][1]:.5f} (r={head_bottom_pts[0][0]:.3f})")
print(f"Center bottom point (r ~ 0): Y = {[p for p in head_bottom_pts if p[0] < 0.05][0][1]:.5f}")

# Analyze top plateau of sound block (Y > 0.15)
block_top_pts = []
for n, v1, v2, v3 in block_tris:
    for v in (v1, v2, v3):
        if v[1] > 0.15:
            r = math.sqrt(v[0]**2 + v[2]**2)
            block_top_pts.append((r, v[1], v))

block_top_pts.sort(key=lambda p: p[1], reverse=True)
print(f"Highest point on sound block: Y = {block_top_pts[0][1]:.5f} (r={block_top_pts[0][0]:.3f})")
print(f"Center top point (r ~ 0): Y = {[p for p in block_top_pts if p[0] < 0.05][0][1]:.5f}")

# When block is at ty = -1.50
block_ty = -1.50
plateau_y = block_top_pts[0][1] + block_ty
print(f"\nSound block plateau (with ty={block_ty}): Y = {plateau_y:.5f}")

# For head bottom to touch plateau_y:
# head_bottom_y + lift_y = plateau_y
# lift_y = plateau_y - head_bottom_y
lowest_head_y = head_bottom_pts[0][1]
required_lift = plateau_y - lowest_head_y
print(f"Required lift_y for exact zero-gap zero-penetration contact: {required_lift:.5f}")
