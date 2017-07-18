import * as _ from 'lodash';
import {RavenCommandData} from '../../RavenCommandData';
import {RequestMethods} from "../../../Http/Request/RequestMethod";
import {IJsonable} from "../../../Json/Contracts";
import {PatchRequest} from "../../../Http/Request/PatchRequest";
import {IRavenObject} from "../../IRavenObject";
import {TypeUtil} from "../../../Utility/TypeUtil";

export class PatchCommandData extends RavenCommandData implements IJsonable {
  protected scriptedPatch: PatchRequest;
  protected patchIfMissing?: PatchRequest = null;
  protected additionalData?: IRavenObject = null;
  protected debugMode: boolean = false;

  constructor(id: string, scriptedPatch: PatchRequest, etag?: number,
    patchIfMissing?: PatchRequest, debugMode?: boolean) {
    super(id, etag);

    this.type = RequestMethods.Patch;
    this.scriptedPatch = scriptedPatch;
    this.patchIfMissing = patchIfMissing;
    this.debugMode = debugMode;
  }

  public toJson(): object {
    let json: object = _.assign(super.toJson(), {
      "Patch": this.scriptedPatch.toJson(),
      "DebugMode": this.debugMode
    });
    
    if (!TypeUtil.isNone(this.patchIfMissing)) {
      _.assign(json, {PatchIfMissing: this.patchIfMissing.toJson()});
    }

    return json;
  }
}
