import { commentsABI } from '@zoralabs/protocol-deployments';
import { Address, encodeFunctionData, Hex, zeroAddress, zeroHash } from 'viem';
import { COMMENTS_ADDRESS } from '@/lib/consts';

export type CommentIdentifierInput = {
  commenter: Address;
  contractAddress: Address;
  tokenId: string;
  nonce: Hex;
};

const emptyReplyTo = {
  commenter: zeroAddress,
  contractAddress: zeroAddress,
  tokenId: BigInt(0),
  nonce: zeroHash,
};

const getCommentCall = ({
  chainId,
  commenter,
  collectionAddress,
  tokenId,
  text,
  replyTo,
  referrer = zeroAddress,
}: {
  chainId: number;
  commenter: Address;
  collectionAddress: Address;
  tokenId: string;
  text: string;
  replyTo?: CommentIdentifierInput;
  referrer?: Address;
}) => {
  const commentsAddress = COMMENTS_ADDRESS[chainId];
  if (!commentsAddress) {
    throw new Error(`Comments contract not configured for chain ${chainId}`);
  }

  const replyToArg = replyTo
    ? {
        commenter: replyTo.commenter,
        contractAddress: replyTo.contractAddress,
        tokenId: BigInt(replyTo.tokenId),
        nonce: replyTo.nonce,
      }
    : emptyReplyTo;

  return {
    to: commentsAddress,
    data: encodeFunctionData({
      abi: commentsABI,
      functionName: 'delegateComment',
      args: [
        commenter,
        collectionAddress,
        BigInt(tokenId),
        text,
        replyToArg,
        zeroAddress,
        referrer,
      ],
    }),
  };
};

export default getCommentCall;
