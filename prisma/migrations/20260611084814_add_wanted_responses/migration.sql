-- CreateTable
CREATE TABLE "WantedResponse" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachment" TEXT,
    "attachType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "wantedPostId" TEXT NOT NULL,

    CONSTRAINT "WantedResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WantedResponse" ADD CONSTRAINT "WantedResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WantedResponse" ADD CONSTRAINT "WantedResponse_wantedPostId_fkey" FOREIGN KEY ("wantedPostId") REFERENCES "WantedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
