import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import ActionButton from 'components/ActionButton'
import { useAsyncError } from 'components/Error/ErrorBoundary'
import useSwitchChain from 'hooks/useSwitchChain'
import { Spinner } from 'icons'
import { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme'

/** A chain-switching ActionButton. */
export default function ChainSwitchButton({ color, chainId }: { color: keyof Colors; chainId: number }) {
  const { account } = useWeb3React()
  const [isPending, setIsPending] = useState(false)

  const switchChain = useSwitchChain()
  const throwError = useAsyncError()
  const onSwitchChain = useCallback(async () => {
    setIsPending(true)
    try {
      await switchChain(chainId)
    } catch (error) {
      throwError(error)
    } finally {
      setIsPending(false)
    }
  }, [chainId, switchChain, throwError])

  const actionProps = useMemo(
    () =>
      isPending
        ? {
            message: account ? <Trans>Switch network in your wallet</Trans> : <Trans>Switching network</Trans>,
            icon: Spinner,
          }
        : {
            message: <Trans>Switch network</Trans>,
            onClick: onSwitchChain,
          },
    [account, isPending, onSwitchChain]
  )

  return (
    <ActionButton color={color} disabled={isPending} action={actionProps}>
      <Trans>Switch</Trans>
    </ActionButton>
  )
}
