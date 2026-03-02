import React, { useState, useEffect, useLayoutEffect, useRef } from "react"
import "./App.css"

// Perlin noise
class PerlinNoise {
  constructor() {
    const pTable = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,254,34,51,156,72,162,31,121,141,162,141,93,114,84,181,222,184,14,205,24,195,243,214,31,12,29,157,192,193,61,45,50,215,115,66,128,199,241,191,106,78,49,81,251,179,204,138,67,242,210,145,235,249,144,236,127,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255]
    this.p = new Array(512).fill(0).map((_, i) => pTable[i & 255])
  }
  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
  lerp(t, a, b) { return a + t * (b - a) }
  grad(hash, x, y, z) {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z)
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  noise(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z)
    const u = this.fade(x), v = this.fade(y), w = this.fade(z)
    const A = this.p[X]+Y, AA = this.p[A]+Z, AB = this.p[A+1]+Z
    const B = this.p[X+1]+Y, BA = this.p[B]+Z, BB = this.p[B+1]+Z
    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA], x, y, z),       this.grad(this.p[BA], x-1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y-1, z),     this.grad(this.p[BB], x-1, y-1, z))),
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA+1], x, y, z-1),   this.grad(this.p[BA+1], x-1, y, z-1)),
        this.lerp(u, this.grad(this.p[AB+1], x, y-1, z-1), this.grad(this.p[BB+1], x-1, y-1, z-1)))
    )
  }
}

const perlinNoise = new PerlinNoise()
// Circle character ramp — sparse → dense for lava-lamp blob look
const CHAR_RAMP = [' ', ' ', ' ', '·', '◦', '○', '◎', '◉', '●'].reverse()
// Low scale = fewer, larger blobs (lava lamp feel)
const NOISE_SCALE = 1.4
// Char aspect ratio correction: chars are ~0.57x as wide as tall
const CHAR_AR = 1.8
// Slow evolution — blobs drift lazily
const NOISE_SPEED = 0.005
// Domain warp strength — twists blobs into organic shapes
const WARP_STRENGTH = 0.60

// Static ASCII art for "Kevin Dong"
const STATIC_TEXT = [
  " _   __           _        ______                  ",
  "| | / /          (_)       |  _  \\                 ",
  "| |/ /  _____   ___ _ __   | | | |___  _ __   __ _ ",
  "|    \\ / _ \\ \\ / / | '_ \\  | | | / _ \\| '_ \\ / _` |",
  "| |\\  \\  __/\\ V /| | | | | | |/ / (_) | | | | (_| |",
  "\\_| \\_/\\___| \\_/ |_|_| |_| |___/ \\___/|_| |_|\\__, |",
  "                                              __/ |",
  "                                             |___/  ",
]
const STATIC_TEXT_HEIGHT = STATIC_TEXT.length
const STATIC_TEXT_WIDTH  = Math.max(...STATIC_TEXT.map(l => l.length))

// Precompute: set of "ty,tx" positions that are 1 char adjacent to any non-space
// character in STATIC_TEXT. Used to blank out a 1-char padding zone around each
// letter stroke so the animation never touches the text directly.
const TEXT_PADDING_SET = new Set()
for (let ty = 0; ty < STATIC_TEXT_HEIGHT; ty++) {
  for (let tx = 0; tx < STATIC_TEXT_WIDTH; tx++) {
    const line = STATIC_TEXT[ty]
    if (tx < line.length && line[tx] !== ' ') {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue
          TEXT_PADDING_SET.add(`${ty + dy},${tx + dx}`)
        }
      }
    }
  }
}

const ASCIIBanner = ({ fullScreen = false }) => {
  const [frame, setFrame] = useState(0)
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 })
  const [isHovering, setIsHovering] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 80, height: 14 })
  const containerRef = useRef(null)
  const animRef = useRef({ smoothX: -1, smoothY: -1, trail: [] })

  const baseFontSize = fullScreen
    ? `${window.innerWidth * 0.010}px`
    : '0.85vw'

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      let containerWidth
      if (fullScreen) {
        containerWidth = window.innerWidth - 6  // subtract 2×3px border
      } else {
        containerWidth = containerRef.current.offsetWidth
      }
      const fontSize = fullScreen ? window.innerWidth * 0.010 : window.innerWidth * 0.0085
      const charWidth = fontSize * 0.6
      // Fullscreen uses line-height 1.0 (matching CSS); inline uses 1.1
      const lineHeight = fullScreen ? fontSize * 1.0 : fontSize * 1.1
      const width = Math.ceil(containerWidth / charWidth)
      // Fullscreen: ceil to ensure full coverage; subtract border from height
      const height = fullScreen
        ? Math.ceil((window.innerHeight - 6) / lineHeight)
        : Math.min(32, Math.max(22, Math.floor(window.innerHeight * 0.32 / lineHeight)))
      setDimensions({ width: Math.max(width, 60), height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    const timer = setTimeout(updateDimensions, 100)
    return () => {
      window.removeEventListener("resize", updateDimensions)
      clearTimeout(timer)
    }
  }, [fullScreen])

  useEffect(() => {
    const timer = setInterval(() => setFrame((p) => p + 1), 50)
    return () => clearInterval(timer)
  }, [])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
  }

  const generateFrame = () => {
    const { width, height } = dimensions
    const t = frame * NOISE_SPEED
    const anim = animRef.current

    // Smooth mouse tracking + trail
    if (isHovering && mousePos.x >= 0) {
      if (anim.smoothX < 0) { anim.smoothX = mousePos.x; anim.smoothY = mousePos.y }
      anim.smoothX += (mousePos.x - anim.smoothX) * 0.14
      anim.smoothY += (mousePos.y - anim.smoothY) * 0.14
      anim.trail.unshift({ x: anim.smoothX, y: anim.smoothY, age: 0 })
      if (anim.trail.length > 28) anim.trail.pop()
      anim.trail.forEach((p) => { p.age += 0.035 })
    } else {
      anim.smoothX = -1
      anim.smoothY = -1
      anim.trail = []
    }

    const mx = anim.smoothX
    const my = anim.smoothY

    const showText = !fullScreen
    const textStartY = showText ? height - STATIC_TEXT_HEIGHT : -999

    let art = ''

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Text overlay: render non-space chars; blank the 1-char padding zone
        // around each letter stroke so animation never touches the text.
        if (showText) {
          const ty = y - textStartY
          const tx = x
          if (ty >= 0 && ty < STATIC_TEXT_HEIGHT && tx >= 0 && tx < STATIC_TEXT_WIDTH) {
            const line = STATIC_TEXT[ty]
            const ch = tx < line.length ? line[tx] : ' '
            if (ch !== ' ') {
              art += ch
              continue
            }
          }
          if (TEXT_PADDING_SET.has(`${ty},${tx}`)) {
            art += ' '
            continue
          }
        }

        const u = width  > 1 ? x / (width  - 1) : 0.5
        const v = height > 1 ? y / (height - 1) : 0.5

        // ── Mouse: strong UV displacement toward cursor ──────────────────
        // Uses char-space distance for a circular influence region,
        // then displaces the noise sample point in UV space by up to 0.22 units —
        // enough to visibly pull nearby blobs toward the cursor.
        let mu = 0, mv = 0

        if (isHovering && mx >= 0) {
          const dx = u - mx
          const dy = v - my
          // Char-space distance (accounts for non-square characters)
          const dxc = dx * width
          const dyc = dy * height * CHAR_AR
          const d2c = dxc * dxc + dyc * dyc
          // Smooth lens distortion: displace proportional to (dx, dy) rather than
          // a unit vector, so the effect is zero at the cursor center and builds
          // gradually — no singularity, no collapsed noise at the hotspot.
          const inf = Math.exp(-d2c / 320)
          mu = -dx * inf * 1.8
          mv = -dy * inf * 1.8

          // Trail: ghost attractors that leave a flowing wake
          for (const tr of anim.trail) {
            const tdx = u - tr.x
            const tdy = v - tr.y
            const tdxc = tdx * width
            const tdyc = tdy * height * CHAR_AR
            const td2c = tdxc * tdxc + tdyc * tdyc
            const fade = Math.exp(-td2c / 80) * Math.exp(-tr.age * 2.8)
            mu -= tdx * fade * 0.5
            mv -= tdy * fade * 0.5
          }
        }

        // ── Domain-warped FBM ────────────────────────────────────────────
        // Step 1: compute warp vectors using noise at the (mouse-shifted) position.
        //         The slow t*0.85 makes blob shapes drift organically.
        const pu = (u + mu) * NOISE_SCALE * CHAR_AR
        const pv = (v + mv) * NOISE_SCALE

        const qx = perlinNoise.noise(pu + 0.0,  pv + 0.0,  t * 0.85) * WARP_STRENGTH
        const qy = perlinNoise.noise(pu + 3.7,  pv + 9.2,  t * 0.85) * WARP_STRENGTH

        // Step 2: sample 2-octave FBM at the warped location.
        //         Second octave adds smaller detail without overwhelming the large shape.
        const wu = pu + qx
        const wv = pv + qy

        const noiseVal =
          perlinNoise.noise(wu,             wv,             t          ) * 0.68 +
          perlinNoise.noise(wu * 2.1 + 1.7, wv * 2.1 + 8.3, t * 1.5 + 4) * 0.32

        // ── Contrast curve → lava-lamp blob look ──────────────────────────
        // Map [-1,1] to [0,1], clamp a mid-range band, then apply smoothstep.
        // This pushes values toward clear "void" or clear "blob" rather than
        // the uniform grey gradient that raw FBM produces.
        let n = (noiseVal + 1) * 0.5          // → [0, 1]
        const lo = 0.26, hi = 0.76
        n = Math.max(0, Math.min(1, (n - lo) / (hi - lo)))   // stretch contrast
        n = n * n * (3 - 2 * n)                               // smoothstep

        const charIdx = Math.min(Math.floor(n * CHAR_RAMP.length), CHAR_RAMP.length - 1)
        art += CHAR_RAMP[charIdx]
      }
      art += '\n'
    }
    return art
  }

  return (
    <div
      ref={containerRef}
      className={`ascii-banner dot-matrix ${fullScreen ? "full-screen" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setMousePos({ x: -1, y: -1 }) }}
    >
      <pre
        style={{
          whiteSpace: "pre",
          lineHeight: "1.0",
          letterSpacing: "0",
          width: "100%",
          height: fullScreen ? "100%" : "auto",
          maxWidth: "100%",
          fontSize: baseFontSize,
          fontFamily: "'TerminalFont', monospace",
          color: "var(--accent)",
          display: "block",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        {generateFrame()}
      </pre>
    </div>
  )
}

const SnakeGame = ({ onExit }) => {
  const canvasRef = useRef()
  const stateRef = useRef({
    snake: [], food: { x: 0, y: 0 },
    dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    score: 0, gameOver: false, started: false,
  })
  const [displayScore, setDisplayScore] = useState(0)
  const [phase, setPhase] = useState("waiting")
  const phaseRef = useRef("waiting")
  const gridRef = useRef({ cols: 0, rows: 0 })

  const FONT_SIZE = 46
  const CELL_W = Math.round(FONT_SIZE * 0.62)   // ≈ 16px
  const CELL_H = Math.round(FONT_SIZE * 1.1)    // ≈ 29px
  const HUD_H = 32
  const FOOTER_H = 28

  const bodyChar = (i, len) => {
    if (i === 0) return '●'
    const r = i / len
    if (r < 0.2) return '◉'
    if (r < 0.4) return '◎'
    if (r < 0.6) return '○'
    if (r < 0.8) return '◦'
    return '·'
  }

  const getAccent = () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#AAB99A"
  const getBg    = () => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()    || "#1E201E"

  const placeFood = (snake) => {
    const { cols, rows } = gridRef.current
    while (true) {
      const pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }
      if (!snake.some(s => s.x === pos.x && s.y === pos.y)) return pos
    }
  }

  const resize = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const totalW = window.innerWidth - 6
    const gameH  = window.innerHeight - 6 - HUD_H - FOOTER_H
    canvas.width  = totalW
    canvas.height = gameH
    gridRef.current = {
      cols: Math.floor(totalW / CELL_W),
      rows: Math.floor(gameH  / CELL_H),
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const accent = getAccent()
    const bg = getBg()
    const s = stateRef.current

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!s.started) {
      ctx.fillStyle = accent
      ctx.font = '18px "Cascadia Code", monospace'
      ctx.textAlign = "center"
      ctx.fillText("Press Arrow Keys or WASD to Start", canvas.width / 2, canvas.height / 2 - 12)
      ctx.font = '13px "Cascadia Code", monospace'
      ctx.fillText("ESC to exit", canvas.width / 2, canvas.height / 2 + 16)
      return
    }

    ctx.font = `${FONT_SIZE}px 'TerminalFont', monospace`
    ctx.textAlign = "left"

    // Food
    ctx.globalAlpha = 1
    ctx.fillStyle = accent
    ctx.fillText('◆', s.food.x * CELL_W, s.food.y * CELL_H + FONT_SIZE)

    // Snake with fading tail
    s.snake.forEach((seg, i) => {
      ctx.globalAlpha = Math.max(0.2, 1 - (i / s.snake.length) * 0.78)
      ctx.fillStyle = accent
      ctx.fillText(bodyChar(i, s.snake.length), seg.x * CELL_W, seg.y * CELL_H + FONT_SIZE)
    })
    ctx.globalAlpha = 1

    if (s.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.65)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = accent
      ctx.font = 'bold 28px "Cascadia Code", monospace'
      ctx.textAlign = "center"
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 28)
      ctx.font = '18px "Cascadia Code", monospace'
      ctx.fillText(`Score: ${s.score}`, canvas.width / 2, canvas.height / 2 + 10)
      ctx.font = '13px "Cascadia Code", monospace'
      ctx.fillText("R to restart  |  ESC to exit", canvas.width / 2, canvas.height / 2 + 44)
    }
  }

  const startGame = (initialDir) => {
    const { cols, rows } = gridRef.current
    const snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]
    stateRef.current = { snake, food: placeFood(snake), dir: initialDir, nextDir: initialDir, score: 0, gameOver: false, started: true }
    setDisplayScore(0)
    phaseRef.current = "playing"
    setPhase("playing")
  }

  // Initial resize + draw; re-draw on resize
  useEffect(() => {
    resize(); draw()
    const onResize = () => { resize(); draw() }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { draw() }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return
    const interval = setInterval(() => {
      const s = stateRef.current
      const { cols, rows } = gridRef.current
      if (s.gameOver) return
      s.dir = { ...s.nextDir }
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        s.gameOver = true; phaseRef.current = "over"; setPhase("over"); draw(); return
      }
      const ate = head.x === s.food.x && head.y === s.food.y
      const newSnake = [head, ...s.snake]
      if (!ate) newSnake.pop()
      else { s.score++; s.food = placeFood(newSnake); setDisplayScore(s.score) }
      s.snake = newSnake
      draw()
    }, 120)
    return () => clearInterval(interval)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard
  useEffect(() => {
    const dirMap = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    }
    const handleKey = (e) => {
      if (e.key === "Escape") { onExit(stateRef.current.score); return }
      const cur = phaseRef.current
      if ((e.key === "r" || e.key === "R") && (cur === "over" || cur === "waiting")) { startGame({ x: 1, y: 0 }); return }
      const newDir = dirMap[e.key]
      if (!newDir) return
      e.preventDefault()
      if (cur === "waiting") { startGame(newDir); return }
      if (cur === "playing") {
        const s = stateRef.current
        if (newDir.x === -s.dir.x && newDir.y === -s.dir.y) return
        s.nextDir = newDir
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onExit]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="snake-overlay">
      <div className="snake-hud snake-hud-top">
        <span>{'// SNAKE'}</span>
        <span>score: {displayScore}</span>
      </div>
      <canvas ref={canvasRef} className="snake-canvas" />
      <div className="snake-hud snake-hud-bottom">
        ↑↓←→ / WASD &nbsp;|&nbsp; R to restart &nbsp;|&nbsp; ESC to exit
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState([])
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef()
  const terminalRef = useRef()
  const [showFullScreenBanner, setShowFullScreenBanner] = useState(false)
  const [showSnakeGame, setShowSnakeGame] = useState(false)

  const themes = {
    green:  { accent: "#AAB99A", accentLight: "#D0DDD0", bg: "#1E201E", text: "#ECDFCC" },
    blue:   { accent: "#7AA2C9", accentLight: "#B0CCE4", bg: "#1A1E24", text: "#D4DEE8" },
    red:    { accent: "#C97A7A", accentLight: "#E4B0B0", bg: "#241A1A", text: "#E8D4D4" },
    purple: { accent: "#A98ACB", accentLight: "#CDB5E0", bg: "#1E1A24", text: "#DED4E8" },
    amber:  { accent: "#C9A84E", accentLight: "#E0CC8A", bg: "#22201A", text: "#E8E0D0" },
  }

  const applyTheme = (name) => {
    const t = themes[name]
    if (!t) return false
    const root = document.documentElement
    root.style.setProperty("--accent", t.accent)
    root.style.setProperty("--accent-light", t.accentLight)
    root.style.setProperty("--bg", t.bg)
    root.style.setProperty("--text", t.text)
    return true
  }

  const linkedin = "https://www.linkedin.com/in/kevinlindong/"
  const github = "https://github.com/kevinlindong"
  const email = "kevindong@nyu.edu"
  const additionalText = "guest@kevinsportfolio:~$ "

  const about = [
    "                                                            ",
    "                          :====:                            ",
    "                        -##%%##%%###*-.                     ",
    "                      :*#%@@@@@%@@@%%##=.                   ",
    "                     +#%@@%#*++++#%@%%%##-                  ",
    "                    *%@@%#*+======+#@@%###=                 ",
    "                   :@@@%#**++======+#@@%%##                 ",
    "                   .@@@####%##++###*++#@@%#                 ",
    "                    =@%+**#**+==+*#++=-*@@*                 ",
    "                     *%=====+=---===---+#%-                 ",
    "                     .#+++++**++====---=+=                  ",
    "                      :++++++**+=====--+-                   ",
    "                       =*+++#*+++++=--+%:                   ",
    "                       :%**+++++=---==##                    ",
    "                        =*#**+++=====-+                     ",
    "                       -#**#%%%##++===##:                   ",
    "                  .:-++*#%#####*+=====*#+.                  ",
    "              .-+***#**#@%####**+++==+##+++-.               ",
    "          :-+**%######%@@%*#*****++++*#*++*%#++=:.          ",
    "        -*####%%%%%%%@@@@%#++======++***++**%%**##+:        ",
    "       =##%%%#%%%%%%%%%%@%#-======+#%@@#**%#%@%**%%**-      ",
    "      +%%#%%%%@%%%%%%%%%@@@=-----=%@@@@@@*%#%%@#%#%##*+.    ",
    "     +%%%%%@%%@%%%%%%%%%@@@#---::-%%%%%%%%%##%@#%%##%#*=    ",
    "    .@%@@@%@%%%%%%#%%%%%%%%%---:.:%%%%%%#%%#%%@%#@%%%%#*.   ",
    "    =@@@%@@@%%%%%%%%%@%%@%%%+:--::#%%%%%#%#%%%@@%%@%@@#*+   ",
    "    *@@@@@@@@%@@@%@%%@%%@%%%+::-::*%%%%##%#%%%%@%%%@@%###.  ",
    "    #@@@@@@@@%%@@@@@%@%%%@%%+-::::+%%%%%%%%%%%%@@@@@%%%#%-  ",
    "   .%@@@@@@@@%%%@@%%%%%%%%%%=-:.::=%%@%%%#%%%%%%%@@@%%%%@*  ",
    "   =@%@@@@@@@%@@@@@@@@%%%%%%=:-::-=%%@%%%#%%%%%#%@@@%%%%%#  ",
    "   #@%@@@@@@@%%%@@@@%%%%%%%%=.---:-#%%%%%#@%%%%#%@@%%%%%@%: ",
    "   %%%@@@@@@@@@@@@@@%%%%%##%=::====+%%@@%%@@@%%%@@%@@%%%@%= ",
    "  -@@@@@@@@@%%%%%@@@@%%@%%#*=::===*+%%@@%%@%@%%#@@@@@%@@@%+ ",
    "  +@@@@@@@@@@@%@@@@@@%%%%%%%==-=-==+#%@@%#@%%%%#@@@@%%%%%%+ ",
    "  #%@@@@@@@@@@@@@@@@@%%%%%%#==-=----=#%%#%@%%%%#@@@%%@%@@@+",
    "",
    "Hi, my name is Kevin Dong!",
    "",
    "I am currently a Junior majoring in Computer Science and minoring Data Science at New York University. I am a curious and avid learner, passionate about software development, quantitative finance, and data science.",
  ]

  const social = [
    `LinkedIn     <a href="${linkedin}" target="_blank" rel="noopener noreferrer">linkedin/kevinlindong</a>`,
    `GitHub       <a href="${github}" target="_blank" rel="noopener noreferrer">github/kevinlindong</a>`,
    `Email        <a href="mailto:${email}?subject=Hello Kevin">${email}</a>`,
  ]

  const projects = [
    '<a href="https://github.com/kevinlindong/LofAI" target="_blank" rel="noopener noreferrer">1. LofAI:</a> An AI-powered endless lofi music player with productivity tools.',
    '<a href="https://github.com/kevinlindong/Precedent_Parser" target="_blank" rel="noopener noreferrer">2. Precedent Parser:</a> A website that helps find precedent for legal research.',
    '<a href="https://github.com/kevinlindong/Duo_Dash" target="_blank" rel="noopener noreferrer">3. Duo Dash:</a> A fun retro arcade style game with a twist.',
    '<a href="https://github.com/kevinlindong/Antivirus_Server" target="_blank" rel="noopener noreferrer">4. Antivirus Server:</a> A web server than scans files for viruses.',
    "",
    'For more details on these projects, visit my <a href="https://github.com/kevinlindong" target="_blank" rel="noopener noreferrer">GitHub</a> page!',
  ]

  const commands = ["about", "social", "projects", "banner", "game", "theme", "clear", "help", "date", "sudo"]

  const help = commands.map((cmd) => `${cmd.padEnd(15)}${getCommandDescription(cmd)}`)

  function getCommandDescription(cmd) {
    const description =
      {
        about: "Information About Me",
        social: "My Online Profiles",
        projects: "My Recent Projects",
        banner: "View and Play With the Banner",
        game: "Play Snake",
        theme: "Change Color Theme (green, blue, red, purple, amber)",
        clear: "Clear Terminal",
        help: "Show Available Commands",
        date: "Display Current Date and Time",
        sudo: "Run a Command with Superuser Privileges",
      }[cmd] || ""

    return description.padEnd(30) // Adjust padding as needed
  }

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  // Scroll to bottom synchronously before paint so output never visibly jumps
  useLayoutEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const handleCommand = (cmd) => {
    const newOutput = [...output, { type: "input", content: additionalText + cmd }]
    switch (cmd.split(" ")[0]) {
      case "help":
        newOutput.push({ type: "output", content: help.join("\n") })
        break
      case "about":
        newOutput.push({ type: "output", content: "\n" + about.join("\n") + "\n" })
        break
      case "social":
        newOutput.push({ type: "output", content: "\n" + social.join("\n") + "\n", isHtml: true })
        break
      case "projects":
        newOutput.push({ type: "output", content: "\n" + projects.join("\n") + "\n", isHtml: true })
        break
      case "clear":
        setOutput([])
        setInput("")
        return
      case "banner":
        setShowFullScreenBanner(true)
        return
      case "game":
        setOutput([...newOutput])
        setHistory([...history, cmd])
        setHistoryIndex(-1)
        setInput("")
        setShowSnakeGame(true)
        return
      case "theme": {
        const themeName = cmd.split(" ")[1]
        if (!themeName) {
          newOutput.push({ type: "output", content: "Usage: theme <name>\nAvailable themes: " + Object.keys(themes).join(", ") + "\n" })
        } else if (applyTheme(themeName)) {
          newOutput.push({ type: "output", content: `Theme changed to '${themeName}'.\n` })
        } else {
          newOutput.push({ type: "output", content: `Unknown theme '${themeName}'. Available: ` + Object.keys(themes).join(", ") + "\n" })
        }
        break
      }
      case "date":
        newOutput.push({ type: "output", content: "It is currently " + new Date().toLocaleString() + "\n" })
        break
      case "sudo":
        newOutput.push({
          type: "output",
          content: "Permission denied: unable to run the command 'undefined' as root.\n",
        })
        window.open("https://www.youtube.com/watch?v=9bZkp7q19f0", "_blank")
        break
      default:
        newOutput.push({
          type: "output",
          content: "Command not found. Type 'help' for a list of available commands.\n",
        })
    }
    setOutput(newOutput)
    setHistory([...history, cmd])
    setHistoryIndex(-1)
    setInput("")

    setTimeout(() => {
      inputRef.current.focus()
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(input)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1)
        setInput(history[history.length - 1 - historyIndex - 1])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > -1) {
        setHistoryIndex(historyIndex - 1)
        setInput(historyIndex === 0 ? "" : history[history.length - 1 - historyIndex + 1])
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const matchingCommands = commands.filter((cmd) => cmd.startsWith(input))
      if (matchingCommands.length === 1) {
        setInput(matchingCommands[0])
      }
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showFullScreenBanner && e.key === "Escape") {
        setShowFullScreenBanner(false)
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [showFullScreenBanner])

  useEffect(() => {
    if (!showFullScreenBanner) {
      setInput("")
      if (inputRef.current) {
        inputRef.current.focus()
      }
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
    }
  }, [showFullScreenBanner])

  useEffect(() => {
    if (output.length === 0) {
      inputRef.current.focus()
    }
  }, [output])

  return (
    <div
      className="App"
      onClick={() => {
        if (!showFullScreenBanner && inputRef.current) {
          inputRef.current.focus()
        }
      }}
    >
      {showSnakeGame && (
        <SnakeGame onExit={(finalScore) => {
          setShowSnakeGame(false)
          setOutput(prev => [...prev,
            { type: "output", content: `High score: ${finalScore}` },
            { type: "output", content: "" },
          ])
          setTimeout(() => { if (inputRef.current) inputRef.current.focus() }, 0)
        }} />
      )}
      {showFullScreenBanner && (
        <div
          className="full-screen-banner"
          onClick={(e) => {
            e.stopPropagation()
            setShowFullScreenBanner(false)
          }}
          tabIndex={0}
        >
          <ASCIIBanner fullScreen={true} />
          <div className="banner-exit-message">Click Anywhere or Press ESC to Exit</div>
        </div>
      )}
      {/* Terminal always stays mounted to prevent layout shift on transition */}
      <div
        className="terminal"
        ref={terminalRef}
        style={{ display: showFullScreenBanner ? "none" : undefined }}
      >
        <ASCIIBanner />
        <p className="terminal-line intro">Welcome to Kevin Dong's Terminal Portfolio.</p>
        <p className="terminal-line intro">
          Type <span className="key">'help'</span> to see a list of available commands.
        </p>
        {output.map((line, index) => (
          <p key={index} className={`terminal-line ${line.type}${line.type === "input" ? " input-line" : ""}`}>
            {line.type === "input" ? (
              <>
                <span className="prompt">{line.content}</span>
                &nbsp;
              </>
            ) : line.isHtml ? (
              <span dangerouslySetInnerHTML={{ __html: line.content }} />
            ) : (
              line.content.split("\n").map((subline, subindex) => (
                <React.Fragment key={subindex}>
                  {subline}
                  {subindex < line.content.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))
            )}
          </p>
        ))}
        <p className="terminal-line input-line">
          <span className="prompt">{additionalText}</span>
          &nbsp;
          <input
            ref={inputRef}
            type="text"
            className="user-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </p>
      </div>
    </div>
  )
}

export default App
