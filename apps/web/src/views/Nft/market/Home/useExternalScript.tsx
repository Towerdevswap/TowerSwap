import { useEffect } from 'react'

function useExternalScript(src: string) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = src
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [src])
}

export default useExternalScript
