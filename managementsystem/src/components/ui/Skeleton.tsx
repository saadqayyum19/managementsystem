export function Skeleton({ width = '100%', height = 12, radius = 6 }: { width?: string | number; height?: number; radius?: number }) {
  return <span className="ec-skeleton" style={{ display: 'block', width, height, borderRadius: radius }} aria-hidden />
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return <tr>{Array.from({ length: columns }).map((_, index) => <td key={index}><Skeleton width={index === 0 ? '70%' : '45%'} height={14} /></td>)}</tr>
}

export function SkeletonRows({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return <>{Array.from({ length: rows }).map((_, index) => <SkeletonRow key={index} columns={columns} />)}</>
}

export function SkeletonCard({ height = 96 }: { height?: number }) {
  return <div className="ec-card ec-card__body" style={{ height }}><Skeleton height={12} width="40%" /><div style={{ height: 12 }} /><Skeleton height={20} width="65%" /></div>
}

export function SkeletonCards({ count = 4, height = 96 }: { count?: number; height?: number }) {
  return <>{Array.from({ length: count }).map((_, index) => <SkeletonCard key={index} height={height} />)}</>
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return <div className="ec-stack"><Skeleton height={12} width="100%" /><Skeleton height={12} width="90%" />{lines > 2 && <Skeleton height={12} width="75%" />}</div>
}
