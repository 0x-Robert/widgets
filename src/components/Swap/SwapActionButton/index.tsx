import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { ChainError, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { AllowanceState } from 'hooks/usePermit2Allowance'
import { usePermit2 } from 'hooks/useSyncFlags'
import { useMemo } from 'react'
import { Field } from 'state/swap'

import ConnectWalletButton from './ConnectWalletButton'
import SwapButton from './SwapButton'
import SwitchChainButton from './SwitchChainButton'
import WrapButton from './WrapButton'

export default function SwapActionButton() {
  const { account, isActive } = useWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency, amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    [Field.OUTPUT]: { currency: outputCurrency },
    error,
    approval,
    allowance,
    trade: { trade },
  } = useSwapInfo()
  const permit2Enabled = usePermit2()
  const isWrap = useIsWrap()
  const isDisabled = useMemo(() => {
    if (permit2Enabled) {
      if (allowance.state === AllowanceState.REQUIRED) {
        return true
      }
    } else {
      if (approval.state !== SwapApprovalState.APPROVED) {
        return true
      }
    }
    return (
      error !== undefined ||
      (!isWrap && !trade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount)
    )
  }, [permit2Enabled, error, isWrap, trade, inputCurrencyAmount, inputCurrencyBalance, allowance.state, approval.state])

  if (!account || !isActive) {
    return <ConnectWalletButton />
  } else if (error === ChainError.MISMATCHED_CHAINS) {
    const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId ?? SupportedChainId.MAINNET
    return <SwitchChainButton chainId={tokenChainId} />
  } else if (isWrap) {
    return <WrapButton disabled={isDisabled} />
  } else {
    return <SwapButton disabled={isDisabled} />
  }
}
