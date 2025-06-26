import GroupItem from './GroupItem';
import './GroupList.css';


export default function GroupList({
  groups,
  myGroupIds,
  currentUserId,
  onJoin,
  onCancel,
  onLeave,
  onGroupSelect,
}) {
  return (
    <div className="glist">
      {groups.map(g => {
        const isMember = myGroupIds.has(g._id);
        const isPending = Array.isArray(g.pendingJoinRequests)
          ? g.pendingJoinRequests.includes(currentUserId)
          : false;

        const status = isMember
          ? 'member'
          : isPending
            ? 'pending'
            : 'none';

        return (
          <GroupItem
            key={g._id}
            group={g}
            status={status}
            onJoin={() => onJoin(g._id)}
            onCancel={() => onCancel(g._id)}
            onLeave={() => onLeave(g._id)}
            onGroupSelect={onGroupSelect}
          />
        );
      })}
    </div>
  );
}