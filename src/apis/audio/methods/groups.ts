import {
  AddEffectToGroupRequest,
  AddEffectToGroupResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  GetGroupRequest,
  GetGroupResponse,
  GetGroupSoundRequest,
  GetGroupSoundResponse,
  Groups,
  ReorderGroupsRequest,
  ReorderGroupsResponse,
  UpdateGroupRequest,
  UpdateGroupResponse
} from '../interface'

export const GroupsAudioAPI: Groups = {
  Get: function (request: GetGroupRequest): GetGroupResponse {
    throw new Error('Function not implemented.')
  },
  Create: function (request: CreateGroupRequest): CreateGroupResponse {
    throw new Error('Function not implemented.')
  },
  Update: function (request: UpdateGroupRequest): UpdateGroupResponse {
    throw new Error('Function not implemented.')
  },
  Delete: function (request: DeleteGroupRequest): DeleteGroupResponse {
    throw new Error('Function not implemented.')
  },
  Reorder: function (request: ReorderGroupsRequest): ReorderGroupsResponse {
    throw new Error('Function not implemented.')
  },
  GetSound: function (request: GetGroupSoundRequest): GetGroupSoundResponse {
    throw new Error('Function not implemented.')
  },
  AddEffect: function (request: AddEffectToGroupRequest): AddEffectToGroupResponse {
    throw new Error('Function not implemented.')
  }
}
