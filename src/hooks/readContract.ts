import { useMemo } from "react";
import { Token, TokenAmount } from "@ubeswap/sdk";
import { useTokenContract } from "hooks/getContract";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";

type MethodArg = string | number | BigNumber;
type OptionalMethodInputs =
  | Array<MethodArg | MethodArg[] | undefined | null>
  | undefined;
interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch?: number;
}

function useGetSingleCallResult<T>(
  contract: Contract | null | undefined,
  methodName: string,
  inputs: OptionalMethodInputs = [],
  options?: ListenerOptions // TODO unused
): () => Promise<T> {
  const getter = async () => await contract?.[methodName](...inputs);
  return getter;
}

export function useGetTokenAllowance(
  token?: Token,
  owner?: string | null,
  spender?: string
): () => Promise<TokenAmount | undefined> {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  const getAllowance = useGetSingleCallResult<BigNumber>(
    contract,
    "allowance",
    inputs
  );

  const getTokenAllowance = async () => {
    const allowance = await getAllowance();
    if (!allowance) {
      return;
    }
    if (!token) {
      console.warn("No token specified in `getTokenAllowance`");
      return;
    }
    return new TokenAmount(token, allowance.toString());
  };

  return getTokenAllowance;
}