import React from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    onPageChange: (page: number) => void;
    itemName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    limit,
    onPageChange,
    itemName = 'mục'
}) => {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PageNumber
                    key={i}
                    active={currentPage === i}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </PageNumber>
            );
        }

        return (
            <div className="flex items-center">
                {startPage > 1 && (
                    <>
                        <PageNumber active={currentPage === 1} onClick={() => onPageChange(1)}>1</PageNumber>
                        {startPage > 2 && <span className="px-2 text-slate-400">...</span>}
                    </>
                )}
                {pages}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
                        <PageNumber active={currentPage === totalPages} onClick={() => onPageChange(totalPages)}>
                            {totalPages}
                        </PageNumber>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Đang hiển thị {startItem} đến {endItem} trong tổng số {totalItems} {itemName}
            </p>

            <div className="flex items-center gap-1">
                <PaginationButton
                    icon={<ChevronFirst size={16} />}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                />
                <PaginationButton
                    icon={<ChevronLeft size={16} />}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                />

                {renderPageNumbers()}

                <PaginationButton
                    icon={<ChevronRight size={16} />}
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                />
                <PaginationButton
                    icon={<ChevronLast size={16} />}
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(totalPages)}
                />
            </div>
        </div>
    );
};

const PaginationButton: React.FC<{ icon: React.ReactNode; disabled?: boolean; onClick?: () => void }> = ({ icon, disabled, onClick }) => (
    <button
        onClick={onClick}
        className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all ${disabled
            ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
            : 'bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm'
            }`}
        disabled={disabled}
    >
        {icon}
    </button>
);

const PageNumber: React.FC<{ children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ children, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${active
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
    >
        {children}
    </button>
);

export default Pagination;
