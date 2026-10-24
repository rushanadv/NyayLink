import struct

def get_y_extents(filepath):
    with open(filepath, "rb") as f:
        f.read(80)
        num_triangles = struct.unpack("<I", f.read(4))[0]
        min_y, max_y = float("inf"), float("-inf")
        top_center_y = float("-inf")
        bottom_center_y = float("inf")
        
        for _ in range(num_triangles):
            data = f.read(50)
            v1 = struct.unpack("<3f", data[12:24])
            v2 = struct.unpack("<3f", data[24:36])
            v3 = struct.unpack("<3f", data[36:48])
            for v in (v1, v2, v3):
                min_y = min(min_y, v[1])
                max_y = max(max_y, v[1])
                if abs(v[0]) < 0.05 and abs(v[2]) < 0.05:
                    top_center_y = max(top_center_y, v[1])
                    bottom_center_y = min(bottom_center_y, v[1])
    return min_y, max_y, top_center_y, bottom_center_y

head_min, head_max, head_tc, head_bc = get_y_extents("stl_assets/modular/part_gavel_head.stl")
block_min, block_max, block_tc, block_bc = get_y_extents("stl_assets/modular/part_sound_block.stl")

print(f"Head: min={head_min:.4f}, max={head_max:.4f}, bottom_center={head_bc:.4f}")
print(f"Block: min={block_min:.4f}, max={block_max:.4f}, top_center={block_tc:.4f}")
print(f"Vertical offset from head bottom to block top (untranslated): {block_tc - head_bc:.4f}")
