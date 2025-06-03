import React, { useState, useEffect, useRef } from "react"
import "./App.css"

const ASCIIBanner = ({ size = "small", fullScreen = false }) => {
  const [frame, setFrame] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 80, height: 10 })
  const containerRef = useRef(null)

  const chars = "⊘ ⊙ ◉ ⦿ ○ ●"
  const baseFontSize = size === "medium" ? "1.2vw" : "1.8vw"

  const staticText = [
    " _  _  ____  _  _  ____  _  _    ____  _____  _  _  ___  ",
    "( )/ )( ___)( \\/ )(_  _)( \\( )  (  _ \\(  _  )( \\( )/ __) ",
    " )  (  )__)  \\  /  _)(_  )  (    )(_) ))(_)(  )  (( (_-. ",
    "(_)\\_)(____)  \\/  (____)(_)\\_)  (____/(_____)(_)\\_)\\___/ ",
    "                                                        ",
  ]

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight
      
      // Calculate character size based on font size
      const fontSize = fullScreen ? window.innerWidth * 0.018 : window.innerWidth * 0.012
      const charWidth = fontSize * 0.6
      
      // Calculate how many characters can fit in the container width
      const width = Math.floor(containerWidth / charWidth) - 2
      const height = fullScreen 
        ? Math.floor(containerHeight / (fontSize * 1.2)) - 4 
        : Math.min(14, Math.floor(containerHeight / (fontSize * 1.2)))
      
      setDimensions({ width: Math.max(width, 60), height: Math.max(height, 3) })
    }

    // Initial update
    updateDimensions()
    
    // Update on resize
    window.addEventListener("resize", updateDimensions)
    
    // Also update when container is ready
    const timer = setTimeout(updateDimensions, 100)
    
    return () => {
      window.removeEventListener("resize", updateDimensions)
      clearTimeout(timer)
    }
  }, [fullScreen])

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => prev + 1)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const generateAsciiFrame = () => {
    let art = ""
    const { width, height } = dimensions
    const frequency = 0.1
    const timeScale = frame * 0.03

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isNamePosition = !fullScreen && y >= height - staticText.length && x < staticText[0].length

        if (isNamePosition) {
          const nameY = y - (height - staticText.length)
          art += staticText[nameY][x] || " "
          continue
        }

        const dx = x / width - mousePos.x
        const dy = y / height - mousePos.y
        const mouseInfluence = Math.exp(-(dx * dx + dy * dy) * 1.5) * 2

        const xOffset = Math.sin(timeScale + y * 0.1) * (2 + mouseInfluence * 3)
        const yOffset = Math.cos(timeScale * 0.7 + x * 0.1) * (2 + mouseInfluence * 3)

        const sampleX = x + xOffset
        const sampleY = y + yOffset

        const wave =
          Math.sin(sampleX * frequency + timeScale) * 0.3 +
          Math.sin((sampleX + sampleY) * frequency * 0.5 + timeScale * 1.1) * 0.3 +
          Math.sin(sampleY * frequency * 0.7 + timeScale * 0.9) * 0.3

        const blob =
          Math.exp(
            -(
              (x - width * 0.3 + Math.sin(timeScale) * 10) ** 2 +
              (y - height * 0.5 + Math.cos(timeScale * 0.7) * 5) ** 2
            ) * 0.001,
          ) +
          Math.exp(
            -(
              (x - width * 0.7 + Math.cos(timeScale * 0.8) * 8) ** 2 +
              (y - height * 0.3 + Math.sin(timeScale * 0.9) * 4) ** 2
            ) * 0.001,
          )

        const value = (wave + blob * 0.5 + mouseInfluence * 0.5) / 2
        const normalized = Math.min(Math.max((value + 1) / 2, 0), 0.99)
        const charIndex = Math.floor(normalized * chars.length)
        art += chars[charIndex]
      }
      art += "\n"
    }
    return art
  }

  return (
    <pre
      ref={containerRef}
      className={`ascii-banner font-mono p-0 overflow-hidden ${fullScreen ? "full-screen" : ""}`}
      onMouseMove={handleMouseMove}
      style={{
        whiteSpace: "pre",
        lineHeight: "1em",
        letterSpacing: "0.1em",
        width: "100%",
        maxWidth: "100%",
        fontSize: baseFontSize,
        fontFamily: "'TerminalFont', monospace",
      }}
    >
      {generateAsciiFrame()}
    </pre>
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
    "I am currently a Sophomore majoring in Computer Science and minoring Data Science at New York University. I am a curious and avid learner, passionate about software development, quantitative finance, and data science.",
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

  const commands = ["about", "social", "projects", "banner", "clear", "help", "date", "sudo"]

  const help = commands.map((cmd) => `${cmd.padEnd(15)}${getCommandDescription(cmd)}`)

  function getCommandDescription(cmd) {
    const description =
      {
        about: "Information About Me",
        social: "My Online Profiles",
        projects: "My Recent Projects",
        banner: "View and Play With the Banner",
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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [])

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
      case "date":
        newOutput.push({ type: "output", content: "\n" + new Date().toLocaleString() + "\n" })
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
      if (terminalRef.current) {
        terminalRef.current.scrollTo({
          top: terminalRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
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
      {showFullScreenBanner ? (
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
      ) : (
        <div className="terminal" ref={terminalRef}>
          <ASCIIBanner />
          <p className="terminal-line intro">Welcome to Kevin Dong's Terminal Portfolio.</p>
          <p className="terminal-line intro">
            Type <span className="key">'help'</span> to see a list of available commands.
          </p>
          {output.map((line, index) => (
            <p key={index} className={`terminal-line ${line.type}`}>
              {line.type === "input" ? (
                <span className="prompt">{line.content}</span>
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
      )}
    </div>
  )
}

export default App