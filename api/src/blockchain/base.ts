import * as dotenv from "dotenv";
dotenv.config();
import { ethers, formatEther, JsonRpcProvider } from "ethers";
import NFTAirdropTracker from "../../NFTAirdropTracker.json";
import logger from "../utils/logger";

const { BASE_RPC_URL, WALLET_PRIVATE_KEY, DEPLOYED_CONTRACT_ADDRESS } =
  process.env;

if (!BASE_RPC_URL) {
  throw new Error("BASE_RPC_URL is required");
}

if (!WALLET_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY is required");
}

if (!DEPLOYED_CONTRACT_ADDRESS) {
  throw new Error("DEPLOYED_CONTRACT_ADDRESS is required");
}

const provider = new JsonRpcProvider(BASE_RPC_URL);
const signer = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  DEPLOYED_CONTRACT_ADDRESS,
  NFTAirdropTracker.abi,
  signer
);

interface TransactionResult {
  success: boolean;
  transactionHash: string;
  blockNumber?: number;
}

async function executeTransaction(
  transactionPromise: Promise<ethers.ContractTransactionResponse>,
  actionDescription: string
): Promise<TransactionResult> {
  try {
    const tx = await transactionPromise;
    logger.info(`${actionDescription} transaction hash:`, tx.hash);

    const receipt = await tx.wait();

    if (receipt && receipt.status === 1) {
      logger.info(
        `${actionDescription} successful. Block number: ${receipt.blockNumber}`
      );
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } else {
      logger.error(`${actionDescription} failed.`);
      return {
        success: false,
        transactionHash: tx.hash,
      };
    }
  } catch (error) {
    logger.error(`Error in ${actionDescription}`);
    logger.error(error);
    throw error;
  }
}
export async function doesProjectExistOnChain(
  projectId: string
): Promise<boolean> {
  try {
    return await contract.doesProjectExist(projectId);
  } catch (error) {
    console.error(`Error checking if project ${projectId} exists:`, error);
    throw error;
  }
}
export async function recordProjectOnChain(
  projectId: string,
  nftContractAddress: string,
  tokenId: string
) {
  return executeTransaction(
    contract.createProject(projectId, nftContractAddress, tokenId),
    `Creating project ${projectId} ${nftContractAddress} ${tokenId} on chain`
  );
}
export async function recordClaimOnChain(projectId: string, userId: string) {
  return executeTransaction(
    contract.recordClaim(projectId, userId),
    `Recording claim for user ${userId} in project ${projectId}`
  );
}

export async function recordWalletAddressOnChain(
  userId: string,
  walletAddress: string
) {
  return executeTransaction(
    contract.recordWalletAddress(userId, walletAddress),
    `Recording wallet address ${walletAddress} for user ${userId}`
  );
}

export async function updateEligibleUsersForAirdrop(projectId: string) {
  const access = await contract.checkProjectAuthorization(
    projectId,
    signer.address
  );
  logger.info(`Access: ${projectId}, ${signer.address}`, access);

  const nftInfo = await contract.getNFTInfo(projectId);
  logger.info(`NFT Info: ${projectId}`, nftInfo);

  return executeTransaction(
    contract.updateEligibleUsersForAirdrop(projectId),
    `Updating eligible users for airdrop in project ${projectId}`
  );
}

export async function getEligibleUsersForAirdrop(projectId: string) {
  return contract.getEligibleUsersForAirdrop(projectId);
}

export enum ClaimState {
  NotClaimed = 0,
  Claimed = 1,
  Airdropped = 2,
}

export async function getClaimState(
  projectId: string,
  userId: string
): Promise<ClaimState> {
  const claimStateBigInt = await contract.getClaimState(projectId, userId);
  const claimState = Number(claimStateBigInt);
  return claimState;
}

export async function getWalletBalance(walletAddress: string) {
  const wei = await provider.getBalance(walletAddress);
  const eth = formatEther(wei);
  return { walletAddress, wei: wei.toString(), eth };
}
