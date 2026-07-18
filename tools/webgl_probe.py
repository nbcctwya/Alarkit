"""探测 headless 环境下能用的 WebGL 启动参数组合。"""
from playwright.sync_api import sync_playwright

COMBOS = [
    ["--use-angle=swiftshader-webgl", "--enable-unsafe-swiftshader"],
    ["--use-gl=angle", "--use-angle=swiftshader", "--in-process-gpu", "--enable-unsafe-swiftshader"],
    ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
    ["--use-gl=egl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
    ["--use-angle=vulkan", "--enable-features=Vulkan,VulkanFromANGLE,DefaultANGLEVulkan", "--enable-unsafe-swiftshader"],
    ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--disable-gpu-sandbox"],
]

JS = """() => {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return 'NO-WEBGL';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  return 'OK: ' + r;
}"""

with sync_playwright() as p:
    for args in COMBOS:
        try:
            b = p.chromium.launch(args=args)
            pg = b.new_page()
            print(args[0], "->", pg.evaluate(JS))
            b.close()
        except Exception as e:
            print(args[0], "-> LAUNCH-FAIL", str(e).splitlines()[0])
