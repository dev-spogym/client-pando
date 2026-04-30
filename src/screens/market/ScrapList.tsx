'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Star, MapPin, Package } from 'lucide-react';
import {
  PageHeader,
  Button,
  Chip,
  Avatar,
  Badge,
  EmptyState,
} from '@/components/ui';
import {
  MOCK_CENTERS,
  MOCK_TRAINERS,
  MOCK_PRODUCTS,
  getCenterById,
  getTrainerById,
  type ScrapTargetType,
} from '@/lib/marketplace';
import { useMarketStore } from '@/stores/marketStore';

type TabKey = 'center' | 'trainer' | 'product' | 'class';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'center', label: '센터' },
  { key: 'trainer', label: '강사' },
  { key: 'product', label: '상품' },
  { key: 'class', label: '수업' },
];

export default function ScrapList() {
  const navigate = useNavigate();
  const { scraps, toggleScrap } = useMarketStore();
  const [activeTab, setActiveTab] = useState<TabKey>('center');
  const [editing, setEditing] = useState(false);

  const countOf = (type: ScrapTargetType) =>
    scraps.filter((s) => s.targetType === type).length;

  const scrappedIds = (type: ScrapTargetType) =>
    scraps.filter((s) => s.targetType === type).map((s) => s.targetId);

  return (
    <div className="min-h-screen bg-surface-secondary pb-10">
      <PageHeader
        title="스크랩"
        showBack
        sticky
        rightSlot={
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-body-sm font-semibold text-primary px-2 py-1 rounded-lg active:bg-primary-light"
          >
            {editing ? '완료' : '편집'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-surface border-b border-line sticky top-14 z-20">
        {TABS.map((tab) => {
          const count = countOf(tab.key as ScrapTargetType);
          return (
            <Chip
              key={tab.key}
              size="md"
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1 text-caption font-bold ${activeTab === tab.key ? 'text-white' : 'text-primary'}`}>
                  {count}
                </span>
              )}
            </Chip>
          );
        })}
      </div>

      <div className="px-4 pt-4">
        {activeTab === 'center' && (
          <CenterTab
            ids={scrappedIds('center')}
            editing={editing}
            onRemove={(id) => toggleScrap('center', id)}
            navigate={navigate}
          />
        )}
        {activeTab === 'trainer' && (
          <TrainerTab
            ids={scrappedIds('trainer')}
            editing={editing}
            onRemove={(id) => toggleScrap('trainer', id)}
            navigate={navigate}
          />
        )}
        {activeTab === 'product' && (
          <ProductTab
            ids={scrappedIds('product')}
            editing={editing}
            onRemove={(id) => toggleScrap('product', id)}
            navigate={navigate}
          />
        )}
        {activeTab === 'class' && <ClassTab navigate={navigate} />}
      </div>
    </div>
  );
}

/* ─── Center tab ─── */
function CenterTab({
  ids,
  editing,
  onRemove,
  navigate,
}: {
  ids: number[];
  editing: boolean;
  onRemove: (id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const centers = ids.map((id) => getCenterById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getCenterById>>[];

  if (centers.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-8 h-8" />}
        title="스크랩한 항목이 없습니다"
        description="마음에 드는 센터를 스크랩해보세요."
        action={
          <Button variant="primary" size="md" onClick={() => navigate('/centers')}>
            센터 둘러보기
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {centers.map((center) => (
        <div
          key={center.id}
          className="bg-surface rounded-card shadow-card-soft overflow-hidden relative cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => !editing && navigate(`/centers/${center.id}`)}
        >
          <div className="relative w-full aspect-video">
            <img src={center.thumbnailUrl} alt={center.name} className="w-full h-full object-cover" />
            {editing && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(center.id); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
                aria-label="제거"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
            {center.isPromoted && (
              <div className="absolute top-2 left-2">
                <Badge tone="accent" size="sm" variant="solid">광고</Badge>
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-h4 text-content font-bold truncate">{center.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-body-sm font-semibold text-content">{center.rating.toFixed(1)}</span>
                <span className="text-caption text-content-tertiary">({center.reviewCount})</span>
              </div>
              <span className="text-content-tertiary text-caption">·</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-content-tertiary" />
                <span className="text-caption text-content-tertiary">{center.distanceKm}km</span>
              </div>
              <span className="text-content-tertiary text-caption">·</span>
              <span className="text-caption text-content-tertiary">{center.district} {center.dong}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-body-sm text-content-secondary">{center.representativeProduct.name}</span>
              <div className="flex items-baseline gap-1">
                {center.representativeProduct.originalPrice && (
                  <span className="text-micro text-content-tertiary line-through">
                    {center.representativeProduct.originalPrice.toLocaleString()}원
                  </span>
                )}
                <span className="text-body font-bold text-primary">
                  {center.representativeProduct.price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Trainer tab ─── */
function TrainerTab({
  ids,
  editing,
  onRemove,
  navigate,
}: {
  ids: number[];
  editing: boolean;
  onRemove: (id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const trainers = ids
    .map((id) => getTrainerById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getTrainerById>>[];

  if (trainers.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-8 h-8" />}
        title="스크랩한 항목이 없습니다"
        description="마음에 드는 강사를 스크랩해보세요."
        action={
          <Button variant="primary" size="md" onClick={() => navigate('/trainers')}>
            강사 둘러보기
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {trainers.map((trainer) => (
        <div
          key={trainer.id}
          className="bg-surface rounded-card shadow-card-soft px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform relative"
          onClick={() => !editing && navigate(`/trainers/${trainer.id}`)}
        >
          <Avatar src={trainer.profileUrl} name={trainer.name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-h4 text-content font-bold truncate">{trainer.name}</p>
            <p className="text-caption text-content-tertiary truncate mt-0.5">{trainer.centerName}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-body-sm font-semibold text-content">{trainer.rating.toFixed(1)}</span>
              <span className="text-caption text-content-tertiary">리뷰 {trainer.reviewCount}개</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {trainer.specialties.slice(0, 2).map((s) => (
                <Badge key={s} tone="primary" size="sm" variant="soft">{s}</Badge>
              ))}
            </div>
          </div>
          {editing ? (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(trainer.id); }}
              className="shrink-0 w-8 h-8 rounded-full bg-state-error/10 flex items-center justify-center"
              aria-label="제거"
            >
              <X className="w-4 h-4 text-state-error" />
            </button>
          ) : (
            <Heart className="shrink-0 w-5 h-5 fill-state-sale text-state-sale" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Product tab ─── */
function ProductTab({
  ids,
  editing,
  onRemove,
  navigate,
}: {
  ids: number[];
  editing: boolean;
  onRemove: (id: number) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const products = ids
    .map((id) => MOCK_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as NonNullable<(typeof MOCK_PRODUCTS)[0]>[];

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-8 h-8" />}
        title="스크랩한 항목이 없습니다"
        description="마음에 드는 상품을 스크랩해보세요."
        action={
          <Button variant="primary" size="md" onClick={() => navigate('/centers')}>
            상품 둘러보기
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-surface rounded-card shadow-card-soft overflow-hidden flex cursor-pointer active:scale-[0.99] transition-transform relative"
          onClick={() => !editing && navigate(`/centers/${product.centerId}`)}
        >
          <div className="relative w-28 aspect-square shrink-0">
            <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
            {editing && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                aria-label="제거"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0 p-3">
            <Badge tone="neutral" size="sm" variant="soft">{product.productCategory}</Badge>
            <p className="text-body font-semibold text-content mt-1 truncate">{product.name}</p>
            <p className="text-caption text-content-tertiary truncate mt-0.5">{product.centerName}</p>
            <div className="flex items-baseline gap-1.5 mt-2">
              {product.originalPrice && (
                <span className="text-caption text-content-tertiary line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
              <span className="text-body font-bold text-primary">
                {product.price.toLocaleString()}원
              </span>
            </div>
            <p className="text-caption text-content-tertiary mt-0.5">{product.duration}</p>
          </div>
          {!editing && (
            <div className="pr-3 flex items-center">
              <Heart className="w-5 h-5 fill-state-sale text-state-sale" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Class tab (empty state) ─── */
function ClassTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <EmptyState
      title="수업 스크랩은 곧 제공됩니다"
      description="업데이트 후 이용 가능해집니다. 먼저 센터나 강사를 스크랩해보세요."
      action={
        <Button variant="secondary" size="md" onClick={() => navigate('/centers')}>
          센터 둘러보기
        </Button>
      }
    />
  );
}

