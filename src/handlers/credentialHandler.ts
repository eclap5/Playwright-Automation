import { DefaultAzureCredential } from "@azure/identity";
import { KeyVaultSecret, SecretClient } from "@azure/keyvault-secrets";

const getKeyVaultClient = async (): Promise<SecretClient> => {
    const credential: DefaultAzureCredential = new DefaultAzureCredential();
    return new SecretClient(process.env.KEY_VAULT_URI, credential);
}

const getKeyVaultSecret = async (secretName: string): Promise<string> => {
    const client: SecretClient = await getKeyVaultClient();
    const secret: KeyVaultSecret = await client.getSecret(secretName);
    return secret.value;
};

export { getKeyVaultSecret };