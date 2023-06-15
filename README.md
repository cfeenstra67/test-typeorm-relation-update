# Test Typeorm Relation Update

Example repo to reproduce a TypeORM bug where related entities do not get updated when they are fetched before their foreign keys are updated.

Steps to reproduce:
1. Run `pnpm install` to install dependencies (or another package manager would probably work fine--using `pnpm` ensures you'll make use of the lock file but this only has a couple of straightforward dependencies and so likely any package manager will work fine)
2. Run the test script with `pnpm ts-node test-typeorm-relation-update.ts`
3. You should see an error like "unexpected relation id in fetchedEntity3". If you inspect the code, you'll see that this shouldn't be happening, but it is.
