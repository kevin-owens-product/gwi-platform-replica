import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react'
import { useTeamApprovals, useReviewApproval } from '@/hooks/useTeams'
import { Badge, Button, DataTable, Modal, Input } from '@/components/shared'
import type { Column } from '@/components/shared'
import type { ApprovalRequest } from '@/api/types'
import { formatDate } from '@/utils/format'
import './ApprovalQueue.css'

interface ApprovalQueueProps {
  teamId: string
}

export default function ApprovalQueue({ teamId }: ApprovalQueueProps) {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)
  const [reviewComment, setReviewComment] = useState('')

  const { data: approvals, isLoading } = useTeamApprovals(teamId, statusFilter ? { status: statusFilter } : undefined)
  const reviewApproval = useReviewApproval()

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!selectedApproval) return
    reviewApproval.mutate({
      teamId,
      approvalId: selectedApproval.id,
      data: { status, comment: reviewComment || undefined },
    }, {
      onSuccess: () => {
        setReviewModalOpen(false)
        setSelectedApproval(null)
        setReviewComment('')
      },
    })
  }

  const openReview = (approval: ApprovalRequest) => {
    setSelectedApproval(approval)
    setReviewComment('')
    setReviewModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'warning' | 'success' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    }
    return <Badge variant={map[status] || 'default'}>{status}</Badge>
  }

  const columns: Column<ApprovalRequest>[] = [
    {
      key: 'entity_name',
      header: 'Content',
      sortable: true,
      render: (a) => (
        <div>
          <div style={{ fontWeight: 500 }}>{a.entity_name}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{a.entity_type}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (a) => <Badge variant={a.action === 'share' ? 'info' : 'primary'}>{a.action}</Badge>,
    },
    {
      key: 'requested_by_name',
      header: 'Requested By',
    },
    {
      key: 'requested_at',
      header: 'Date',
      render: (a) => formatDate(a.requested_at),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => getStatusBadge(a.status),
    },
    {
      key: 'id',
      header: '',
      width: '100px',
      render: (a) => a.status === 'pending' ? (
        <Button variant="secondary" size="sm" onClick={() => openReview(a)}>
          Review
        </Button>
      ) : (
        a.review_comment ? (
          <span title={a.review_comment} style={{ cursor: 'help', color: '#64748b' }}>
            <MessageSquare size={14} />
          </span>
        ) : null
      ),
    },
  ]

  return (
    <div className="approval-queue">
      <div className="approval-queue__header">
        <div>
          <h3 className="approval-queue__title">
            <CheckCircle2 size={18} />
            Approval Queue
          </h3>
          <p className="approval-queue__subtitle">
            Review and approve content before it is shared or exported.
          </p>
        </div>
        <select
          className="approval-queue__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={approvals ?? []}
        keyField="id"
        loading={isLoading}
        emptyMessage="No approval requests"
      />

      {/* Review Modal */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review: ${selectedApproval?.entity_name ?? ''}`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              icon={<XCircle size={16} />}
              onClick={() => handleReview('rejected')}
              loading={reviewApproval.isPending}
              style={{ color: '#ef4444' }}
            >
              Reject
            </Button>
            <Button
              icon={<CheckCircle2 size={16} />}
              onClick={() => handleReview('approved')}
              loading={reviewApproval.isPending}
            >
              Approve
            </Button>
          </>
        }
      >
        {selectedApproval && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <strong>Content:</strong> {selectedApproval.entity_name}
            </div>
            <div>
              <strong>Type:</strong> {selectedApproval.entity_type}
            </div>
            <div>
              <strong>Action:</strong> {selectedApproval.action}
            </div>
            <div>
              <strong>Requested by:</strong> {selectedApproval.requested_by_name}
            </div>
            <div>
              <label className="input-field__label">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a reason for your decision..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
