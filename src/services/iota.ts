import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Ed25519KeypairSigner } from "@iota/iota-interaction-ts/node/test_utils";
import { getFaucetHost, requestIotaFromFaucetV0 } from "@iota/iota-sdk/faucet";
import {
  NotarizationClient,
  NotarizationClientReadOnly,
  OnChainNotarization,
} from '@iota/notarization/node';
import { KeyPairSigner } from '@iota/iota-interaction-ts/node';

const NETWORK_URL = process.env.NETWORK_URL || 'https://api.devnet.iota.cafe';
const EXPLORER_URL = 'https://explorer.rebased.iota.org/?network=devnet';
const PACKAGE_ID = process.env.IOTA_NOTARIZATION_PKG_ID || '';

let notarizationClient: NotarizationClient | null = null;
let readOnlyClient: NotarizationClientReadOnly | null = null;

export async function requestFunds(address: string) {
    await requestIotaFromFaucetV0({
        host: getFaucetHost('devnet'),
        recipient: address,
    });
}

function getKeypair(): Ed25519Keypair {
  return Ed25519Keypair.generate();
}

function getIotaClient(): IotaClient {
  return new IotaClient({ url: NETWORK_URL });
}

async function getReadOnlyClient(): Promise<NotarizationClientReadOnly> {
  // if (!readOnlyClient) {
    const iotaClient = getIotaClient();
    readOnlyClient = PACKAGE_ID
      ? await NotarizationClientReadOnly.createWithPkgId(iotaClient, PACKAGE_ID)
      : await NotarizationClientReadOnly.create(iotaClient);
  // }
  return readOnlyClient;
}

async function getNotarizationClient(): Promise<NotarizationClient> {
  if (!notarizationClient) {
    const roClient = await getReadOnlyClient();
    const keypair = getKeypair();
    const signer = new Ed25519KeypairSigner(keypair);
    // KeyPairSigner.iotaPublicKeyBytes() is sync but TransactionSigner expects async - known WASM type mismatch
    notarizationClient = await NotarizationClient.create(roClient, signer);
  }
  return notarizationClient;
}

export async function createNotarization(
  claimHash: string,
  description: string,
): Promise<{ notarizationId: string; digest: string }> {
  const client = await getNotarizationClient();
  await requestFunds(client.senderAddress());
  const txBuilder = client
    .createLocked()
    .withStringState(claimHash)
    .withImmutableDescription(description)
    .finish();

  const result = await txBuilder.buildAndExecute(client);

  const notarization = result.output as OnChainNotarization;

  return {
    notarizationId: notarization.id,
    digest: result.response.digest,
  };
}

export async function getNotarization(
  notarizationId: string,
): Promise<{
  found: boolean;
  contentHash?: string;
  description?: string;
  createdAt?: bigint;
}> {
  try {
    const roClient = await getReadOnlyClient();
    const notarization = await roClient.getNotarizationById(notarizationId);

    return {
      found: true,
      contentHash: notarization.state.data.toString(),
      description: notarization.immutableMetadata.description,
      createdAt: notarization.immutableMetadata.createdAt,
    };
  } catch (error) {
    console.error('Verification error:', error);
    return { found: false };
  }
}

export interface NotarizationSummary {
  id: string;
  contentHash: string;
  description?: string;
  createdAt?: bigint;
  method: string;
}

export async function getAllNotarizations(): Promise<NotarizationSummary[]> {
  const client = await getNotarizationClient();
  const iotaClient = client.iotaClient();
  const owner = client.senderAddress();
  const pkgId = client.packageId();

  const results: NotarizationSummary[] = [];
  let cursor: string | null | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const page = await iotaClient.getOwnedObjects({
      owner,
      filter: { StructType: `${pkgId}::notarization::Notarization` },
      options: { showContent: true, showType: true },
      cursor: cursor ?? undefined,
      limit: 50,
    });

    const roClient = await getReadOnlyClient();
    for (const obj of page.data) {
      if (obj.data?.objectId) {
        try {
          const n = await roClient.getNotarizationById(obj.data.objectId);
          results.push({
            id: n.id,
            contentHash: n.state.data.toString(),
            description: n.immutableMetadata.description,
            createdAt: n.immutableMetadata.createdAt,
            method: n.method,
          });
        } catch {
          // skip objects that can't be parsed
        }
      }
    }

    hasMore = page.hasNextPage;
    cursor = page.nextCursor;
  }

  return results;
}

export function getExplorerUrl(objectId: string): string {
  return `${EXPLORER_URL}&object=${objectId}`;
}
