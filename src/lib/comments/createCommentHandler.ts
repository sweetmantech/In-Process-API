import { NextResponse } from 'next/server';
import {
  createComment,
  type CreateCommentInput,
} from '@/lib/comments/createComment';

const createCommentHandler = async (
  input: CreateCommentInput
): Promise<NextResponse> => {
  const result = await createComment(input);
  return NextResponse.json(result);
};

export default createCommentHandler;
