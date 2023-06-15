import { Column, DataSource, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class TestEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  relationId!: number;

  @ManyToOne(() => TestRelation)
  @JoinColumn({ name: 'relationId' })
  relation!: Promise<TestRelation>;

}

@Entity()
class TestRelation {

  @PrimaryGeneratedColumn()
  id!: number;

}

async function main() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [TestEntity, TestRelation]
  });
  await dataSource.initialize();
  await dataSource.synchronize(true);

  const manager = dataSource.manager;

  // Creating 2 possible relation objects
  const relation1 = manager.create(TestRelation);
  const relation2 = manager.create(TestRelation);
  await manager.save([relation1, relation2]);

  // Creating an entity that has a reference to relation1
  const entity = manager.create(TestEntity, {
    relationId: relation1.id
  });
  await manager.save(entity);

  // If we try to just update `relationId` and save, it works
  // as expected
  const fetchedEntity = await manager.findOneOrFail(TestEntity, {
    where: { id: entity.id }
  });
  if (fetchedEntity.relationId !== relation1.id) {
    throw new Error('Unexpected relation id in fetchedEntity');
  }
  fetchedEntity.relationId = relation2.id;
  await manager.save(fetchedEntity);

  const fetchedEntity2 = await manager.findOneOrFail(TestEntity, {
    where: { id: entity.id }
  });
  if (fetchedEntity2.relationId !== relation2.id) {
    throw new Error('Unexpected relation id in fetchedEntity2');
  }
  
  // However, if we now fetch the `relation` field _then_ update
  // the `relationId`, it does not update the field
  await fetchedEntity2.relation;

  fetchedEntity2.relationId = relation1.id;
  await manager.save(fetchedEntity2);

  const fetchedEntity3 = await manager.findOneOrFail(TestEntity, {
    where: { id: entity.id }
  });
  // This will throw, but it shouldn't
  if (fetchedEntity3.relationId !== relation1.id) {
    throw new Error('Unexpected relation id in fetchedEntity3');
  }
}

main();
