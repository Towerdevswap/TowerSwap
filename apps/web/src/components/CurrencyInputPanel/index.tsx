import { Currency, Pair, Token } from '@pancakeswap/sdk'
import { Button, ChevronDownIcon, Text, useModal, Flex, Box, NumericalInput, CopyButton } from '@pancakeswap/uikit'
import styled, { css } from 'styled-components'
import { isAddress } from 'utils'
import { useTranslation } from '@pancakeswap/localization'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'

import { useBUSDCurrencyAmount } from 'hooks/useBUSDPrice'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { StablePair } from 'views/AddLiquidity/AddStableLiquidity/hooks/useStableLPDerivedMintInfo'

import { useAccount } from 'wagmi'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { CurrencyLogo, DoubleCurrencyLogo } from '../Logo'

import AddToWalletButton from '../AddToWallet/AddToWalletButton'

const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })<{ zapStyle?: ZapStyle }>`
  padding: 8px;
  box-shadow: 1px 1px 2px 1px #6e6464;
  border-radius: 2px;
  margin: 2px 2px 2px;
  ${({ zapStyle, theme }) =>
    zapStyle &&
    css`
      padding: 8px;
      border: 1px solid ${theme.colors.cardBorder};
      border-radius: ${zapStyle === 'zap' ? '0px' : '8px'} 8px 8px 8px;
      height: auto;
    `};
`
const BalanceButton = styled.div`
  padding: 5px;
  justify-content: flex-end;
`

const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: blue;
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
`
const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: 2px 2px 4px 2px #6e6464;
  border-radius: 2px;
  z-index: 1;
`
const Container = styled.div<{ zapStyle?: ZapStyle; error?: boolean }>`
  border-radius: 0px;
  box-shadow: ${({ theme, error }) => theme.shadows[error ? 'warning' : 'inset']};
  ${({ zapStyle }) =>
    !!zapStyle &&
    css`
      border-radius: 0px 16px 16px 16px;
    `};
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.6;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

type ZapStyle = 'noZap' | 'zap'

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onInputBlur?: () => void
  onPercentInput?: (percent: number) => void
  onMax?: () => void
  showQuickInputButton?: boolean
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | StablePair | null
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  zapStyle?: ZapStyle
  beforeButton?: React.ReactNode
  disabled?: boolean
  error?: boolean
  showBUSD?: boolean
  tokensToShow?: Token[]
}
export default function CurrencyInputPanel({
  value,
  onUserInput,
  onInputBlur,
  onPercentInput,
  onMax,
  showQuickInputButton = false,
  showMaxButton,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  zapStyle,
  beforeButton,
  pair = null, // used for double token logo
  otherCurrency,
  id,
  showCommonBases,
  commonBasesType,
  showSearchInput,
  disabled,
  error,
  showBUSD,
  tokensToShow,
}: CurrencyInputPanelProps) {
  const { address: account } = useAccount()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { t } = useTranslation()

  const token = pair ? pair.liquidityToken : currency?.isToken ? currency : null
  const tokenAddress = token ? isAddress(token.address) : null

  const amountInDollar = useBUSDCurrencyAmount(
    showBUSD ? currency : undefined,
    Number.isFinite(+value) ? +value : undefined,
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
      showSearchInput={showSearchInput}
      tokensToShow={tokensToShow}
    />,
  )

  return (
    <Box position="relative" id={id}>
      <InputPanel>
        <Container as="label" zapStyle={zapStyle} error={error}>
        <Flex alignItems="center" justifyContent="space-between">
        <CurrencySelectButton
          zapStyle={zapStyle}
          alignItems="center"
          className="open-currency-select-button"
          selected={!!currency}
          onClick={() => {
            if (!disableCurrencySelect) {
              onPresentCurrencyModal()
            }
          }}
        >
          <Flex alignItems="center" justifyContent="space-between">
            {pair ? (
              <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
            ) : currency ? (
              <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
            ) : null}
            {pair ? (
              <Text id="pair" bold>
                {pair?.token0.symbol}:{pair?.token1.symbol}
              </Text>
            ) : (
              <Text id="pair" bold>
                {(currency && currency.symbol && currency.symbol.length > 20
                  ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                      currency.symbol.length - 5,
                      currency.symbol.length,
                    )}`
                  : currency?.symbol) || t('Select a currency')}
              </Text>
            )}
            {!disableCurrencySelect && <ChevronDownIcon />}
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Flex>
              {beforeButton}
              {token && tokenAddress ? (
                <Flex style={{ gap: '4px' }} ml="4px" alignItems="center">
                  <CopyButton
                    width="16px"
                    buttonColor="textSubtle"
                    text={tokenAddress}
                    tooltipMessage={t('Token address copied')}
                  />
                  <AddToWalletButton
                    variant="text"
                    p="0"
                    height="auto"
                    width="fit-content"
                    tokenAddress={tokenAddress}
                    tokenSymbol={token.symbol}
                    tokenDecimals={token.decimals}
                    tokenLogo={token instanceof WrappedTokenInfo ? token.logoURI : undefined}
                  />
                </Flex>
              ) : null}
            </Flex>
          </Flex>
        </CurrencySelectButton>
        <BalanceButton>
        {account && (
          <Text
            onClick={!disabled && onMax}
            color="textSubtle"
            fontSize="14px"
            style={{ display: 'inline', cursor: 'pointer' }}
          >
            {!hideBalance && !!currency
              ? t('Balance: %balance%', { balance: selectedCurrencyBalance?.toSignificant(6) ?? t('Loading') })
              : ' -'}
          </Text>
        )}
        </BalanceButton>
        </Flex>
          <LabelRow>
            <NumericalInput
            style={{ paddingTop:'10px' }}
              error={error}
              disabled={disabled}
              className="token-amount-input"
              value={value}
              onBlur={onInputBlur}
              onUserInput={(val) => {
                onUserInput(val)
              }}
            />
          </LabelRow>
          {!!currency && showBUSD && Number.isFinite(amountInDollar) && (
            <Flex justifyContent="flex-end" mr="1rem">
              <Flex maxWidth="200px">
                <Text fontSize="12px" color="textSubtle">
                  ~{formatNumber(amountInDollar)} USD
                </Text>
              </Flex>
            </Flex>
          )}
          <InputRow selected={disableCurrencySelect}>
            {account && currency && selectedCurrencyBalance?.greaterThan(0) && !disabled && label !== 'To' && (
              <Flex alignItems="right" justifyContent="right" paddingTop='5px'>
                {showQuickInputButton &&
                  onPercentInput &&
                  [25, 50, 75].map((percent) => (
                    <Button
                      key={`btn_quickCurrency${percent}`}
                      onClick={() => {
                        onPercentInput(percent)
                      }}
                      scale="xs"
                      mr="5px"
                      variant="primary"
                      style={{ textTransform: 'uppercase' }}
                    >
                      {percent}%
                    </Button>
                  ))}
                {showMaxButton && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onMax?.()
                    }}
                    scale="xs"
                    variant="primary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('Max')}
                  </Button>
                )}
              </Flex>
            )}
          </InputRow>
        </Container>
        {disabled && <Overlay />}
      </InputPanel>
    </Box>
  )
}
