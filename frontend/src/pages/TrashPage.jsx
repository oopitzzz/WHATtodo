import { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as todoApi from '../backend/todoApi';

export default function TrashPage() {
  const [trashItems, setTrashItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const PAGE_SIZE = 20;

  // 휴지통 데이터 로드
  useEffect(() => {
    fetchTrash(currentPage);
  }, [currentPage]);

  const fetchTrash = async (page) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await todoApi.getTrash({ page, pageSize: PAGE_SIZE });
      setTrashItems(response.data?.items || []);
      setPagination(response.data?.meta || {});
    } catch (err) {
      setError('휴지통 데이터를 불러올 수 없습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await todoApi.restoreTodo(id, 'ACTIVE');
      setTrashItems(prev => prev.filter(item => item.todo_id !== id));
    } catch (err) {
      setError('복원에 실패했습니다');
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('이 항목을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await todoApi.permanentlyDeleteTodo(id);
        setTrashItems(prev => prev.filter(item => item.todo_id !== id));
      } catch (err) {
        setError('삭제에 실패했습니다');
        console.error(err);
      }
    }
  };

  if (isLoading && trashItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="md" text="휴지통을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">휴지통</h1>
        <p className="text-gray-600">삭제된 항목은 30일 이후 자동으로 영구 삭제됩니다</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 휴지통 항목 */}
      {trashItems.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg font-medium">휴지통이 비어있습니다</p>
          <p className="text-gray-400 text-sm mt-2">삭제된 항목이 여기에 표시됩니다</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {trashItems.map(item => (
              <div
                key={item.todo_id}
                className="bg-white rounded-lg shadow-md p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-through">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{item.description}</p>
                  )}
                  {item.deleted_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      삭제일: {new Date(item.deleted_at).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRestore(item.todo_id)}
                  >
                    복원
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handlePermanentDelete(item.todo_id)}
                  >
                    영구삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                이전
              </Button>

              <div className="text-gray-600 text-sm">
                페이지 {currentPage} / {pagination.totalPages}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === pagination.totalPages || isLoading}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
