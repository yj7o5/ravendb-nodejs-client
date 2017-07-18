/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import * as BluebirdPromise from 'bluebird';
import * as _ from 'lodash';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as args from '../args';
import {RequestExecutor} from "../src/Http/Request/RequestExecutor";
import {ClusterRequestExecutor} from "../src/Http/Request/ClusterRequestExecutor";
import {IndexDefinition} from "../src/Database/Indexes/IndexDefinition";
import {IRavenResponse} from "../src/Database/RavenCommandResponse";
import {DocumentConventions} from "../src/Documents/Conventions/DocumentConventions";
import {CreateDatabaseCommand} from "../src/Database/Commands/CreateDatabaseCommand";
import {DatabaseDocument} from "../src/Database/DatabaseDocument";
import {PutIndexesCommand} from "../src/Database/Commands/PutIndexesCommand";
import {DeleteDatabaseCommand} from "../src/Database/Commands/DeleteDatabaseCommand";
import {StringUtil} from "../src/Utility/StringUtil";

const defaultUrl: string = StringUtil.format("http://{ravendb-host}:{ravendb-port}", args);
const defaultDatabase: string = "NorthWindTest";
const clusterRequestExecutor: ClusterRequestExecutor = ClusterRequestExecutor.create([defaultUrl], defaultDatabase);

let indexMap: string;
let index: IndexDefinition;
let requestExecutor: RequestExecutor;

before(() => {
  chai.use(chaiAsPromised);
});

beforeEach(async function() {
  const dbDoc: DatabaseDocument = new DatabaseDocument
    (defaultDatabase, {"Raven/DataDir": "test"});

  await clusterRequestExecutor.execute(new CreateDatabaseCommand(dbDoc));

  indexMap = [
    'from doc in docs ',
    'select new{',
    'Tag = doc["@metadata"]["@collection"],',
    'LastModified = (DateTime)doc["@metadata"]["Last-Modified"],',
    'LastModifiedTicks = ((DateTime)doc["@metadata"]["Last-Modified"]).Ticks}'
  ].join('');

  index = new IndexDefinition("Testing", indexMap);
  requestExecutor = RequestExecutor.create([defaultUrl], defaultDatabase);
 
  await requestExecutor.execute(new PutIndexesCommand(index));

  _.assign(this.currentTest, {
    indexDefinition: index,
    indexMap,
    clusterRequestExecutor,
    requestExecutor,
    defaultUrl,
    defaultDatabase
  });
});

afterEach(async function() {
  ['currentTest', 'indexDefinition', 'indexMap',  'defaultUrl', 
    'clusterRequestExecutor', 'requestExecutor', 'defaultDatabase']
   .forEach((key: string) => delete this.currentTest[key]);

  return clusterRequestExecutor
    .execute(new DeleteDatabaseCommand(defaultDatabase, true));
});