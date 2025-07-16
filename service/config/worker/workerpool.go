package worker

import "sync"

func RunWorkerPool(jobs []func()) {
	var wg sync.WaitGroup
	workerCount := 5
	jobChan := make(chan func())

	for i := 0; i < workerCount; i++ {
		go func() {
			for job := range jobChan {
				job()
				wg.Done()
			}
		}()
	}

	for _, job := range jobs {
		wg.Add(1)
		jobChan <- job
	}

	close(jobChan)
	wg.Wait()
}
