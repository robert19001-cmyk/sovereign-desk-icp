export const idlFactory = ({ IDL }) => {
  const AgentBrief = IDL.Record({
    'id' : IDL.Nat,
    'approvedAt' : IDL.Opt(IDL.Int),
    'approvedBy' : IDL.Opt(IDL.Principal),
    'createdAt' : IDL.Int,
    'createdBy' : IDL.Principal,
    'answer' : IDL.Text,
    'scope' : IDL.Text,
    'approved' : IDL.Bool,
    'prompt' : IDL.Text,
  });
  return IDL.Service({
    'approve_brief' : IDL.Func([IDL.Nat], [AgentBrief], []),
    'draft_brief' : IDL.Func([IDL.Text, IDL.Text], [AgentBrief], []),
    'list_briefs' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(AgentBrief)],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
