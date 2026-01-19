import { useCallback, useEffect, useRef, useState } from "react"

function Egg() {
  const [svgMarkup, setSvgMarkup] = useState("")
  const [isFeeding, setIsFeeding] = useState(false)
  const [isDraggingBasket, setIsDraggingBasket] = useState(false)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [eggsEaten, setEggsEaten] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupText, setPopupText] = useState("")
  const [orderText, setOrderText] = useState("")
  const [eggPackCount, setEggPackCount] = useState(null)
  const [showEggCountPopup, setShowEggCountPopup] = useState(false)
  const [eggCountPopupText, setEggCountPopupText] = useState("")
  const [eggmanSrc, setEggmanSrc] = useState("/sprites/egggame/eggman.svg")
  const [showNudePopup, setShowNudePopup] = useState(false)
  const dragPosRef = useRef({ x: 0, y: 0 })
  const eggmanRef = useRef(null)
  const feedingTimeoutRef = useRef(null)
  const popupTimeoutRef = useRef(null)
  const eggCountSwapTimeoutRef = useRef(null)
  const keyBufferRef = useRef("")
  const eggmanMoveTimeoutRef = useRef(null)
  const [eggmanCentered, setEggmanCentered] = useState(false)
  const eggmanStopTimeoutRef = useRef(null)
  const [eggmanWalkStopped, setEggmanWalkStopped] = useState(false)
  const pantsTimeoutsRef = useRef([])
  const eggmanSrcRef = useRef(eggmanSrc)
  const [freezeEggmanWalk, setFreezeEggmanWalk] = useState(false)
  const [eggmanStomping, setEggmanStomping] = useState(false)

  const isOverEggman = useCallback((x, y) => {
    const target = document.elementFromPoint(x, y)
    return Boolean(eggmanRef.current && target && eggmanRef.current.contains(target))
  }, [])

  const triggerFeeding = useCallback(() => {
    setIsFeeding(true)
    setEggsEaten((count) => {
      const nextCount = count + 1
      if (nextCount === 10 || nextCount === 15 || nextCount === 19 || nextCount === 26) {
        if (nextCount === 10) setPopupText("6 EGGS")
        if (nextCount === 15) setPopupText("3 EGGS")
        if (nextCount === 19) setPopupText("2 EGGS")
        if (nextCount === 26) {
          setPopupText(
            'Dude, you ran out of eggs. Would you like to buy a 80 pack of eggs?'
          )
        }
        setShowPopup(true)
        if (popupTimeoutRef.current) {
          window.clearTimeout(popupTimeoutRef.current)
        }
        if (nextCount !== 26) {
          popupTimeoutRef.current = window.setTimeout(() => {
            setShowPopup(false)
          }, 3000)
        }
      }
      return nextCount
    })
    setEggPackCount((count) => {
      if (count === 80) {
        setEggCountPopupText("You now have 40 eggs.")
        setShowEggCountPopup(true)
        if (popupTimeoutRef.current) {
          window.clearTimeout(popupTimeoutRef.current)
        }
        popupTimeoutRef.current = window.setTimeout(() => {
          setShowEggCountPopup(false)
        }, 3000)
        return 40
      }
      if (typeof count === "number") {
        const nextCount = Math.max(0, count - 1)
        if (nextCount === 39) {
          setEggCountPopupText("41 EGGS")
          setShowEggCountPopup(true)
          if (popupTimeoutRef.current) {
            window.clearTimeout(popupTimeoutRef.current)
          }
          if (eggCountSwapTimeoutRef.current) {
            window.clearTimeout(eggCountSwapTimeoutRef.current)
          }
          popupTimeoutRef.current = window.setTimeout(() => {
            setShowEggCountPopup(false)
            setEggmanSrc("/sprites/egggame/eggwalking.svg")
          }, 4000)
          eggCountSwapTimeoutRef.current = window.setTimeout(() => {
            setEggCountPopupText("Congrats big boy")
          }, 2000)
        }
        return nextCount
      }
      return count
    })
    if (feedingTimeoutRef.current) {
      window.clearTimeout(feedingTimeoutRef.current)
    }
    feedingTimeoutRef.current = window.setTimeout(() => {
      setIsFeeding(false)
    }, 600)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetch(eggmanSrc)
      .then((res) => res.text())
      .then((text) => {
        if (isMounted) setSvgMarkup(text)
      })
    return () => {
      isMounted = false
    }
  }, [eggmanSrc])
  useEffect(() => {
    if (!isDraggingBasket) return
    const handleMouseUp = (event) => {
      setIsDraggingBasket(false)
      const x = event?.clientX ?? dragPosRef.current.x
      const y = event?.clientY ?? dragPosRef.current.y
      if (isOverEggman(x, y)) triggerFeeding()
    }
    const handleMouseMove = (event) => {
      setDragPos({ x: event.clientX, y: event.clientY })
      dragPosRef.current = { x: event.clientX, y: event.clientY }
    }
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("dragend", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("dragend", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isDraggingBasket, isOverEggman, triggerFeeding])
  useEffect(() => {
    return () => {
      if (feedingTimeoutRef.current) {
        window.clearTimeout(feedingTimeoutRef.current)
      }
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current)
      }
      if (eggCountSwapTimeoutRef.current) {
        window.clearTimeout(eggCountSwapTimeoutRef.current)
      }
      if (eggmanMoveTimeoutRef.current) {
        window.clearTimeout(eggmanMoveTimeoutRef.current)
      }
      if (eggmanStopTimeoutRef.current) {
        window.clearTimeout(eggmanStopTimeoutRef.current)
      }
      if (pantsTimeoutsRef.current.length) {
        pantsTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
        pantsTimeoutsRef.current = []
      }
    }
  }, [])
  useEffect(() => {
    eggmanSrcRef.current = eggmanSrc
  }, [eggmanSrc])
  useEffect(() => {
    const isEggwalking = eggmanSrc.includes("eggwalking.svg")
    const isEggdefault = eggmanSrc.includes("eggman.svg") && !isEggwalking
    if (eggmanMoveTimeoutRef.current) {
      window.clearTimeout(eggmanMoveTimeoutRef.current)
    }
    if (eggmanStopTimeoutRef.current) {
      window.clearTimeout(eggmanStopTimeoutRef.current)
    }
    if (freezeEggmanWalk && isEggwalking) return
    if (isEggwalking) {
      setEggmanWalkStopped(false)
      eggmanMoveTimeoutRef.current = window.setTimeout(() => {
        setEggmanCentered(true)
      }, 1000)
      eggmanStopTimeoutRef.current = window.setTimeout(() => {
        setEggmanWalkStopped(true)
      }, 3200)
    } else if (isEggdefault) {
      setEggmanCentered(false)
      setEggmanWalkStopped(false)
      setFreezeEggmanWalk(false)
      setEggmanStomping(false)
    }
  }, [eggmanSrc, freezeEggmanWalk])
  useEffect(() => {
    if (!eggmanWalkStopped) return
    setFreezeEggmanWalk(true)
    setEggmanStomping(false)
    const sequence = [
      "/sprites/egggame/eggmanpants1.svg",
      "/sprites/egggame/eggmanpants2.svg",
      "/sprites/egggame/eggmanpants31.svg",
      "/sprites/egggame/eggmanpants4.svg",
      "/sprites/egggame/eggmanpants31.svg",
      "/sprites/egggame/eggmanpants2.svg",
      "/sprites/egggame/eggmanpants1.svg",
      "/sprites/egggame/eggwalking.svg",
    ]
    if (pantsTimeoutsRef.current.length) {
      pantsTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      pantsTimeoutsRef.current = []
    }
    setEggmanSrc(sequence[0])
    const stepMs = 1000
    let delay = 0
    sequence.slice(1).forEach((src) => {
      delay += stepMs
      const extraHold = src === "/sprites/egggame/eggmanpants4.svg" ? 600 : 0
      const timeoutId = window.setTimeout(() => {
        setEggmanSrc(src)
      }, delay)
      pantsTimeoutsRef.current.push(timeoutId)
      delay += extraHold
    })
    const stompStart = delay + 400
    const stompDuration = 1000
    const stompStartId = window.setTimeout(() => {
      setEggmanStomping(true)
    }, stompStart)
    const stompEndId = window.setTimeout(() => {
      setEggmanStomping(false)
    }, stompStart + stompDuration)
    const turn1Time = stompStart + stompDuration + 400
    const turn2Time = stompStart + stompDuration + 900
    const turn1Id = window.setTimeout(() => {
      setEggmanSrc("/sprites/egggame/eggmanturn1.svg")
    }, turn1Time)
    const turn2Id = window.setTimeout(() => {
      setEggmanSrc("/sprites/egggame/eggmanturn2.svg")
    }, turn2Time)
    const buttFrames = [
      "/sprites/egggame/eggmanbutt1.svg",
      "/sprites/egggame/eggmanbutt2.svg",
      "/sprites/egggame/eggmanbutt3.svg",
      "/sprites/egggame/eggmanbutt4.svg",
      "/sprites/egggame/eggmanbutt5.svg",
      "/sprites/egggame/eggmanbutt6.svg",
    ]
    const buttStep = 400
    buttFrames.forEach((src, index) => {
      const buttId = window.setTimeout(() => {
        setEggmanSrc(src)
        if (index === buttFrames.length - 1) {
          setShowNudePopup(true)
        }
      }, turn2Time + 400 + buttStep * index)
      pantsTimeoutsRef.current.push(buttId)
    })
    pantsTimeoutsRef.current.push(stompStartId, stompEndId, turn1Id, turn2Id)
    return () => {
      pantsTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      pantsTimeoutsRef.current = []
    }
  }, [eggmanWalkStopped])
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      if (isEditable) return
      if (event.key.length !== 1) return
      const nextBuffer = (keyBufferRef.current + event.key.toLowerCase()).slice(-4)
      keyBufferRef.current = nextBuffer
      if (nextBuffer === "skip") {
        setEggsEaten(25)
        keyBufferRef.current = ""
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
  useEffect(() => {
    const className = "egg-cursor"
    if (isDraggingBasket) {
      document.body.classList.add(className)
    } else {
      document.body.classList.remove(className)
    }
  }, [isDraggingBasket])

  return (
    <main style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <div
          style={{
            backgroundColor: "#CCCACA",
            border: "4px solid #000",
            boxSizing: "border-box",
            minHeight: "calc(100vh - 80px)",
            margin: "40px",
            position: "relative",
          }}
        >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 48,
            borderTop: "4px solid #000",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 48,
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 70,
              transform: "translateX(-50%)",
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 36,
              color: "#000",
            }}
          >
            FEED EGGS
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                top: 6 + index * 10,
                borderTop: "2px solid #000",
              }}
            />
          ))}
        </div>
        {showPopup ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "780px",
              height: "360px",
              backgroundColor: "#fff",
              border: "4px solid #000",
              transform: "translate(-50%, -50%)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 36,
                fontFamily: '"Press Start 2P", monospace',
                color: "#000",
                textAlign: "center",
                lineHeight: 1.4,
                zIndex: 2,
              }}
            >
              {popupText}
              {popupText.includes("Dude, you ran out of eggs") ? (
                <input
                  type="text"
                  aria-label="Egg order quantity"
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "8px 10px",
                    border: "2px solid #000",
                    backgroundColor: "#fff",
                    color: "#000",
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 16,
                    boxSizing: "border-box",
                    display: "block",
                    position: "relative",
                    zIndex: 3,
                  }}
                  value={orderText}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setOrderText(nextValue)
                    if (nextValue.trim().toLowerCase() === "yes") {
                      setShowPopup(false)
                      setEggPackCount(80)
                    }
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
                border: "1px solid #000",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 48,
                backgroundColor: "#fff",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: 6 + index * 10,
                    borderTop: "2px solid #000",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 48,
                borderTop: "4px solid #000",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </div>
        ) : null}
        {showEggCountPopup ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "780px",
              height: "360px",
              backgroundColor: "#fff",
              border: "4px solid #000",
              transform: "translate(-50%, -50%)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
                border: "1px solid #000",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 48,
                backgroundColor: "#fff",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: 6 + index * 10,
                    borderTop: "2px solid #000",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 48,
                borderTop: "4px solid #000",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 36,
                fontFamily: '"Press Start 2P", monospace',
                color: "#000",
                textAlign: "center",
                lineHeight: 1.4,
                zIndex: 2,
              }}
            >
              {eggCountPopupText}
            </div>
          </div>
        ) : null}
        {showNudePopup ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "780px",
              height: "360px",
              backgroundColor: "#fff",
              border: "4px solid #000",
              transform: "translate(-50%, -50%)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
                border: "1px solid #000",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 48,
                backgroundColor: "#fff",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: 6 + index * 10,
                    borderTop: "2px solid #000",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 48,
                borderTop: "4px solid #000",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 36,
                fontFamily: '"Press Start 2P", monospace',
                color: "#000",
                textAlign: "center",
                lineHeight: 1.4,
                zIndex: 2,
              }}
            >
              You're looking at a nude egg.
            </div>
          </div>
        ) : null}
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

        .eggman {
          display: inline-block;
          height: 317px;
          width: auto;
        }
        .eggman svg {
          display: block;
          width: auto;
          height: 100%;
        }
        body {
          overflow: hidden;
        }
        .eggman.eggdefault.is-open svg #path7,
        .eggman.eggdefault.is-open svg #path8,
        .eggman.eggdefault.is-open svg #path9,
        .eggman.eggdefault.is-open svg #path11,
        .eggman.eggdefault.is-open svg #path12 {
          display: none !important;
        }
        .eggman.eggdefault.is-open svg #path2,
        .eggman.eggdefault.is-open svg #ellipse2,
        .eggman.eggdefault.is-open svg #path3,
        .eggman.eggdefault.is-open svg #ellipse3 {
          display: inline !important;
        }
        .eggman.eggdefault.is-open svg #path4 {
          display: inline !important;
        }
        .eggman.eggdefault.is-feeding svg #path7,
        .eggman.eggdefault.is-feeding svg #path8,
        .eggman.eggdefault.is-feeding svg #path9,
        .eggman.eggdefault.is-feeding svg #path11,
        .eggman.eggdefault.is-feeding svg #path12 {
          display: inline !important;
        }
        .eggman.eggdefault.is-feeding svg #path2,
        .eggman.eggdefault.is-feeding svg #ellipse2,
        .eggman.eggdefault.is-feeding svg #path3,
        .eggman.eggdefault.is-feeding svg #ellipse3 {
          display: none !important;
        }
        .eggman.eggdefault.is-feeding svg #path4 {
          display: none !important;
        }
        .eggman.eggdefault.is-feeding svg #path9,
        .eggman.eggdefault.is-feeding svg #path11,
        .eggman.eggdefault.is-feeding svg #path12 {
          display: inline !important;
          transform-box: fill-box;
          transform-origin: center;
          animation: mouth-pulse 0.3s ease-in-out infinite;
        }
        .eggman.eggdefault.is-feeding svg #path11 {
          animation: mouth-corner-left 0.3s ease-in-out infinite;
        }
        .eggman.eggdefault.is-feeding svg #path12 {
          animation: mouth-corner-right 0.3s ease-in-out infinite;
        }
        .eggman.eggwalking svg #path5,
        .eggman.eggwalking svg #path6 {
          transform-box: fill-box;
          transform-origin: top center;
        }
        .eggman.eggwalking svg #path5 {
          animation: foot-left 0.4s steps(1, end) infinite;
        }
        .eggman.eggwalking svg #path6 {
          animation: foot-right 0.4s steps(1, end) infinite;
        }
        .eggman.eggwalking.eggstop svg #path5,
        .eggman.eggwalking.eggstop svg #path6 {
          animation: none;
        }
        .eggman.eggwalking.eggstop svg #path5 {
          transform: scaleY(0.75);
        }
        .eggman.eggwalking.eggstop svg #path6 {
          transform: scaleY(1);
        }
        .eggman.eggwalking.eggstop.eggstomp svg #path5,
        .eggman.eggwalking.eggstop.eggstomp svg #path6 {
          animation: foot-stomp 0.16s steps(1, end) 6;
        }
        @keyframes foot-stomp {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.7);
          }
        }
        @keyframes foot-left {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.75);
          }
        }
        @keyframes foot-right {
          0%,
          100% {
            transform: scaleY(0.75);
          }
          50% {
            transform: scaleY(1);
          }
        }
        @keyframes mouth-pulse {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.5);
          }
        }
        @keyframes mouth-corner-left {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(37.1231px);
          }
        }
        @keyframes mouth-corner-right {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-37.1231px);
          }
        }
        body.egg-cursor {
          cursor: grabbing;
        }
      `}</style>
      <div
        ref={eggmanRef}
        className={`eggman ${isFeeding ? "is-feeding" : "is-open"} ${
          eggmanSrc.includes("eggwalking.svg") ? "eggwalking" : ""
        } ${eggmanSrc.includes("eggman.svg") ? "eggdefault" : ""} ${
          eggmanWalkStopped ? "eggstop" : ""
        } ${eggmanStomping ? "eggstomp" : ""}`}
        style={{
          position: "fixed",
          left: eggmanCentered ? "50%" : 80,
          bottom: 80,
          transform: eggmanCentered ? "translateX(-50%)" : "translateX(0)",
          transition: "left 1.2s linear, transform 1.2s linear",
        }}
        aria-label="Eggman"
        role="img"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
      <img
        src="/sprites/egggame/eggbasket.png"
        alt="Egg basket"
        style={{ position: "fixed", right: 80, bottom: 80, cursor: "grab" }}
        onMouseDown={(event) => {
          setDragPos({ x: event.clientX, y: event.clientY })
          dragPosRef.current = { x: event.clientX, y: event.clientY }
          setIsDraggingBasket(true)
        }}
        onDragStart={(event) => event.preventDefault()}
      />
      {eggPackCount !== null ? (
        <div
          style={{
            position: "fixed",
            right: 120,
            bottom: 50,
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 18,
            color: "#000",
          }}
        >
          EGGS: {eggPackCount}
        </div>
      ) : null}
      {isDraggingBasket ? (
        <svg
          width="72"
          height="90"
          viewBox="0 0 32 40"
          aria-hidden="true"
          style={{
            position: "fixed",
            left: dragPos.x,
            top: dragPos.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <ellipse
            cx="16"
            cy="20"
            rx="12"
            ry="16"
            fill="#fff"
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      ) : null}
      </div>
    </main>
  )
}

export default Egg
