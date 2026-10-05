import zlib
import struct

def recolor_png(input_path, output_path, target_rgb=(155, 82, 127)):
    with open(input_path, 'rb') as f:
        data = f.read()

    pos = 8
    chunks = []

    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        chunk_type = data[pos+4:pos+8]
        chunk_data = data[pos+8:pos+8+length]
        pos += 12 + length

        if chunk_type == b'IHDR':
            width, height, bitdepth, colortype, comp, filt, inter = struct.unpack('>IIBBBBB', chunk_data)
            ihdr_chunk = (chunk_type, chunk_data)
        elif chunk_type == b'IDAT':
            chunks.append(chunk_data)

    idat_bytes = b''.join(chunks)
    decompressed = zlib.decompress(idat_bytes)

    bytes_per_pixel = 4 # RGBA
    stride = 1 + width * bytes_per_pixel

    new_decompressed = bytearray()

    # Re-construct pixels scanline by scanline
    # Assuming filter type 0 or unfiltering: since we process scanlines, let's parse un-filtered or filter-aware
    # Let's unfilter if needed. But usually browser export or simple PNGs use basic filters.
    # Let's do robust scanline unfiltering:
    raw_lines = []
    for y in range(height):
        start = y * stride
        filt_type = decompressed[start]
        line_data = bytearray(decompressed[start+1:start+stride])
        raw_lines.append((filt_type, line_data))

    # Unfilter
    def get_prev_x(line, x, bpp):
        return line[x - bpp] if x >= bpp else 0

    def get_prev_y(prev_line, x):
        return prev_line[x] if prev_line else 0

    def get_paeth(a, b, c):
        p = a + b - c
        pa = abs(p - a)
        pb = abs(p - b)
        pc = abs(p - c)
        if pa <= pb and pa <= pc: return a
        elif pb <= pc: return b
        else: return c

    unfiltered_lines = []
    prev_line = None

    for y in range(height):
        filt_type, line = raw_lines[y]
        unfilt = bytearray(len(line))
        bpp = bytes_per_pixel
        for i in range(len(line)):
            x_prev = unfilt[i - bpp] if i >= bpp else 0
            y_prev = prev_line[i] if prev_line else 0
            xy_prev = prev_line[i - bpp] if (prev_line and i >= bpp) else 0

            if filt_type == 0:
                unfilt[i] = line[i]
            elif filt_type == 1:
                unfilt[i] = (line[i] + x_prev) & 0xFF
            elif filt_type == 2:
                unfilt[i] = (line[i] + y_prev) & 0xFF
            elif filt_type == 3:
                unfilt[i] = (line[i] + (x_prev + y_prev) // 2) & 0xFF
            elif filt_type == 4:
                unfilt[i] = (line[i] + get_paeth(x_prev, y_prev, xy_prev)) & 0xFF
        
        unfiltered_lines.append(unfilt)
        prev_line = unfilt

    # Recolor: convert dark blue pixels to #9B527F (155, 82, 127)
    tr, tg, tb = target_rgb

    output_lines = bytearray()
    for y in range(height):
        output_lines.append(0) # Filter type 0 None
        line = unfiltered_lines[y]
        for x in range(width):
            idx = x * 4
            r, g, b, a = line[idx], line[idx+1], line[idx+2], line[idx+3]

            # Calculate dark intensity (0 = pure white, 1 = pure dark line)
            luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            darkness = 1.0 - luma

            if darkness > 0.05:
                # Blend white (255,255,255) to target (tr, tg, tb) based on darkness
                new_r = int(255 - darkness * (255 - tr))
                new_g = int(255 - darkness * (255 - tg))
                new_b = int(255 - darkness * (255 - tb))
            else:
                new_r, new_g, new_b = 255, 255, 255

            output_lines.append(min(255, max(0, new_r)))
            output_lines.append(min(255, max(0, new_g)))
            output_lines.append(min(255, max(0, new_b)))
            output_lines.append(a)

    # Compress IDAT
    new_idat = zlib.compress(bytes(output_lines), 9)

    def make_chunk(ctype, cdata):
        crc = zlib.crc32(ctype + cdata) & 0xFFFFFFFF
        return struct.pack('>I', len(cdata)) + ctype + cdata + struct.pack('>I', crc)

    with open(output_path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(make_chunk(ihdr_chunk[0], ihdr_chunk[1]))
        f.write(make_chunk(b'IDAT', new_idat))
        f.write(make_chunk(b'IEND', b''))

    print(f"Successfully saved recolored logo to {output_path}")

recolor_png("public/college-logo.png", "public/college-logo-recolored.png")
