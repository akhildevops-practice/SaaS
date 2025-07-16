import {
  QueryFilterPreprocessing,
  TransformToChartData,
  flattenNestedObjToObj,
} from './dashboard.utils';

describe('DashboardUtils', () => {
  test('flattenNestedObjToObj', () => {
    const testObj = {
      a: 1,
      b: {
        c: 1,
      },
    };

    const expected = flattenNestedObjToObj(testObj);

    expect(expected).toEqual({ a: 1, c: 1 });
  });

  test('QueryFilterPreprocessing - 1', () => {
    const testData = {
      creator: 'john',
      department: 'sales',
      documentEndDate: '2020-01-01',
      documentStartDate: '2020-01-01',
      documentId: '1',
      documentName: 'test',
      documentType: 'test',
      documentStatus: 'test',
      documentTag: 'test',
      documentVersion: 'A',
      limit: 10,
      location: 'test',
      page: 1,
      readAccess: 'test',
      searchQuery: 'abc',
    };

    const expected = QueryFilterPreprocessing(testData);
    expect(expected).toBeTruthy();
  });

  test('QueryFilterPreprocessing - 2', () => {
    const testData = {
      creator: 'john',
      department: 'sales',
      documentId: '1',
      documentName: 'test',
      documentType: 'test',
      documentStatus: 'test',
      documentTag: 'test',
      documentVersion: 'A',
      limit: 10,
      location: 'test',
      page: 1,
      readAccess: 'test',
    };

    const expected = QueryFilterPreprocessing(testData);
    expect(expected).toBeTruthy();
  });

  test('TransformToChartData - 1', () => {
    const testData = [
      {
        documentType: 'Payments Invoice',
        locationName: 'Guwahati',
        count: 3,
      },
      {
        documentType: 'Resume',
        locationName: 'Guwahati',
        count: 6,
      },
    ];

    const expected = TransformToChartData('documentType', testData);
    expect(expected).toBeTruthy();
  });

  test('TransformToChartData - 2', () => {
    const testData = [
      { count: 6, tags: 'dev' },
      { count: 6, tags: 'resume' },
      { count: 6, tags: 'work' },
      { count: 1, tags: 'dsf' },
      { count: 1, tags: 'asczx' },
      { count: 1, tags: 'jjgb' },
      { count: 1, tags: 'sad' },
      { count: 1, tags: 'vcvcvcv' },
      { count: 1, tags: 'vxc' },
      { count: 1, tags: 'ewq' },
    ];

    const expected = TransformToChartData('tags', testData);
    expect(expected).toBeTruthy();
  });

  test('TransformToChartData - 2', () => {
    const testData = [
      { readAccess: 'Organization', locationName: 'Guwahati', count: 3 },
      {
        readAccess: 'Restricted Access',
        locationName: 'Guwahati',
        count: 6,
      },
    ];
    const expected = TransformToChartData('readAccess', testData);
    expect(expected).toBeTruthy();
  });
});
