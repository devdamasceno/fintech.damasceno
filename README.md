# Damasceno Consórcios

Site Next.js com formulários de cadastro e mini CRM em `/crm`.

## Firebase

O Firebase Web SDK conecta o navegador diretamente ao Authentication e ao Firestore. Não é necessário instalar ou configurar o Firebase Admin SDK nem compartilhar senha ou chave de conta de serviço.

1. No Firebase Console do projeto, ative **Authentication → E-mail/senha** e crie as contas da equipe. O painel não oferece criação pública de contas.
2. Crie o banco Firestore e publique as regras de [`firestore.rules`](./firestore.rules). Elas permitem novos cadastros validados pelos formulários, mas só permitem ler ou atualizar leads ao e-mail autorizado nas regras.
3. O acesso do CRM está autorizado para `teste@damasceno.com`. Para incluir/remover membros, atualize `isCrmUser()` em `firestore.rules` e publique as regras novamente.
4. As configurações públicas do app Web já estão no `.env` local (ignorado pelo Git). Reinicie `yarn dev` depois de alterar variáveis de ambiente.

O CRM pesquisa os 200 cadastros mais recentes, atualiza a etapa do atendimento ao clicar em “Salvar” e mostra um aviso em tempo real de novos leads enquanto estiver aberto e autenticado. Leads com status “Contato sem sucesso” aparecem no fim da lista; os demais permanecem ordenados do mais novo ao mais antigo. As regras do Firestore devem permitir o novo valor de status `sem_sucesso`. O resumo de perfil usa apenas a modalidade e os valores informados no formulário; não faz buscas externas nem estima crédito ou capacidade financeira. Analytics não está habilitado.

## Desenvolvimento

```bash
yarn install
yarn dev
```
