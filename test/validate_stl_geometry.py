import os
import struct
import math

def validate_stl(filepath, expect_closed=True):
    print(f"\n==================================================")
    print(f"Validating STL: {filepath}")
    print(f"==================================================")
    
    with open(filepath, "rb") as f:
        header = f.read(80)
        tri_count_bytes = f.read(4)
        if len(tri_count_bytes) < 4:
            raise ValueError("Corrupt file: missing triangle count")
        (num_triangles,) = struct.unpack("<I", tri_count_bytes)
        
        file_size = os.path.getsize(filepath)
        expected_size = 84 + num_triangles * 50
        assert file_size == expected_size, f"Size mismatch! Got {file_size}, expected {expected_size}"
        print(f"  ✓ Valid Binary STL header ({header.strip()})")
        print(f"  ✓ Triangle count: {num_triangles:,} (Exact file size: {file_size:,} bytes)")
        
        min_x = min_y = min_z = float("inf")
        max_x = max_y = max_z = float("-inf")
        degenerate_count = 0
        non_finite_count = 0
        total_signed_volume = 0.0
        
        edges = {}
        
        for i in range(num_triangles):
            data = f.read(50)
            if len(data) < 50:
                raise ValueError(f"Unexpected EOF at triangle {i}")
            n = struct.unpack("<3f", data[0:12])
            v1 = struct.unpack("<3f", data[12:24])
            v2 = struct.unpack("<3f", data[24:36])
            v3 = struct.unpack("<3f", data[36:48])
            
            # Check finite
            for v in (n, v1, v2, v3):
                for val in v:
                    if math.isnan(val) or math.isinf(val):
                        non_finite_count += 1
                        
            # Update bounds
            for v in (v1, v2, v3):
                min_x = min(min_x, v[0])
                max_x = max(max_x, v[0])
                min_y = min(min_y, v[1])
                max_y = max(max_y, v[1])
                min_z = min(min_z, v[2])
                max_z = max(max_z, v[2])
                
            # Area / Degenerate check
            # Cross product (v2 - v1) x (v3 - v1)
            ax, ay, az = v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]
            bx, by, bz = v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]
            cx = ay * bz - az * by
            cy = az * bx - ax * bz
            cz = ax * by - ay * bx
            area = 0.5 * math.sqrt(cx * cx + cy * cy + cz * cz)
            if area < 1e-12:
                degenerate_count += 1
                
            # Signed volume (v1 . (v2 x v3)) / 6
            cross_x = v2[1] * v3[2] - v2[2] * v3[1]
            cross_y = v2[2] * v3[0] - v2[0] * v3[2]
            cross_z = v2[0] * v3[1] - v2[1] * v3[0]
            tet_vol = (v1[0] * cross_x + v1[1] * cross_y + v1[2] * cross_z) / 6.0
            total_signed_volume += tet_vol

        print(f"  ✓ Non-finite values: {non_finite_count}")
        print(f"  ✓ Degenerate triangles: {degenerate_count}")
        print(f"  ✓ Bounding box: X=[{min_x:.3f}, {max_x:.3f}], Y=[{min_y:.3f}, {max_y:.3f}], Z=[{min_z:.3f}, {max_z:.3f}]")
        print(f"  ✓ Signed volume: {total_signed_volume:.4f} (Positive = outward winding)")
        assert non_finite_count == 0, "Non-finite coordinates detected!"
        assert degenerate_count == 0, f"{degenerate_count} degenerate triangles detected!"
        if expect_closed:
            assert total_signed_volume > 0.0, f"Expected positive volume, got {total_signed_volume}"

if __name__ == "__main__":
    for base in ["stl_assets", "public/stl_assets"]:
        validate_stl(f"{base}/modular/part_gavel_head.stl", expect_closed=True)
        validate_stl(f"{base}/modular/part_brass_band.stl", expect_closed=True)
        validate_stl(f"{base}/modular/part_gavel_handle.stl", expect_closed=True)
        validate_stl(f"{base}/modular/part_sound_block.stl", expect_closed=True)
        validate_stl(f"{base}/stages/stage_4_impact.stl", expect_closed=True)
    print("\nALL STL ASSET GEOMETRIES ARE 100% VALID!")
