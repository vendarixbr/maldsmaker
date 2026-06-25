'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cursorRef.current
    if (!el) return

    // Hide default cursor on desktop only
    const isMobile = window.matchMedia('(hover: none)').matches
    if (isMobile) { el.style.display = 'none'; return }

    let raf: number
    let x = -100, y = -100

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
    }

    const render = () => {
      el.style.transform = `translate(${x - el.offsetWidth / 2}px, ${y - el.offsetHeight / 2}px)`
      raf = requestAnimationFrame(render)
    }

    const onEnterClickable = () => el.classList.add('expanded')
    const onLeaveClickable = () => el.classList.remove('expanded')

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(render)

    const clickables = document.querySelectorAll('a, button, [role="button"], input, textarea, select')
    clickables.forEach(el => {
      el.addEventListener('mouseenter', onEnterClickable)
      el.addEventListener('mouseleave', onLeaveClickable)
    })

    // Refresh on DOM changes (for dynamically rendered elements)
    const observer = new MutationObserver(() => {
      const fresh = document.querySelectorAll('a, button, [role="button"], input, textarea, select')
      fresh.forEach(el => {
        el.addEventListener('mouseenter', onEnterClickable)
        el.addEventListener('mouseleave', onLeaveClickable)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return <div id="mm-cursor" ref={cursorRef} aria-hidden="true" />
}
