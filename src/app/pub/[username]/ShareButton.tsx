'use client'

import { Button, Icon } from '@/components/gf/primitives'
import { toast } from '@/components/ui/Toast'

export function ShareButton() {
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<Icon.Share size={13} />}
      onClick={() => {
        navigator.clipboard?.writeText(window.location.href)
        toast.success('Link copied')
      }}
    >
      Share
    </Button>
  )
}
