"""打开页面，收集控制台/页面错误并截图，用于调试。"""
import sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5000/"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/webstar_shot.png"
WAIT_MS = int(sys.argv[3]) if len(sys.argv) > 3 else 2500
ACTIONS = sys.argv[4] if len(sys.argv) > 4 else ""  # 例如 "explode" 或 "select:sensor"

with sync_playwright() as p:
    # headless shell 无法创建 WebGL 上下文；改用完整版 Chromium 以 headed 模式跑（走软件渲染）
    browser = p.chromium.launch(headless=False, args=[
        "--use-gl=angle", "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader", "--no-sandbox",
        "--window-position=10000,10000",  # 尽量移到屏幕外，避免打扰
    ])
    page = browser.new_page(viewport={"width": 1600, "height": 950})

    logs = []
    page.on("console", lambda m: logs.append(f"[console:{m.type}] {m.text}"))
    page.on("pageerror", lambda e: logs.append(f"[pageerror] {e}"))
    page.on("requestfailed", lambda r: logs.append(f"[requestfailed] {r.url} {r.failure}"))

    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(WAIT_MS)

    if "explode" in ACTIONS:
        page.click("#explode-btn")
        page.wait_for_timeout(1800)
    if ACTIONS.startswith("select:"):
        pid = ACTIONS.split(":", 1)[1]
        page.click(f'.part-item[data-id="{pid}"]')
        page.wait_for_timeout(1200)

    page.screenshot(path=OUT)
    browser.close()

print(f"screenshot -> {OUT}")
print("--- logs ---")
print("\n".join(logs) if logs else "(no console output)")
